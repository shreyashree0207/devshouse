import { supabase } from './supabase';

/**
 * Live Transparency Score Calculator
 * Score = (verified proofs / total updates) × 40
 *       + (milestones completed / total milestones) × 40
 *       + (returning donors / total donors) × 20
 *
 * Updates the NGO's score in real-time after every proof upload or milestone completion.
 */
export async function calculateLiveTransparencyScore(ngoId: string): Promise<number> {
  const [proofsRes, milestonesRes, donorsRes] = await Promise.all([
    supabase.from('proof_submissions').select('id, status').eq('ngo_id', ngoId),
    supabase.from('milestones').select('id, status').eq('ngo_id', ngoId),
    supabase.from('donations').select('user_id, created_at').eq('ngo_id', ngoId),
  ]);

  const proofs = proofsRes.data || [];
  const milestones = milestonesRes.data || [];
  const donors = donorsRes.data || [];

  // Proof verification rate (40%)
  const totalProofs = proofs.length || 1;
  const verifiedProofs = proofs.filter(p => p.status === 'verified').length;
  const proofScore = (verifiedProofs / totalProofs) * 40;

  // Milestone completion rate (40%)
  const totalMilestones = milestones.length || 1;
  const completedMilestones = milestones.filter(m => m.status === 'RELEASED').length;
  const milestoneScore = (completedMilestones / totalMilestones) * 40;

  // Returning donors rate (20%)
  const uniqueDonors = new Set(donors.map(d => d.user_id));
  const donorsByUser: Record<string, number> = {};
  donors.forEach(d => { donorsByUser[d.user_id] = (donorsByUser[d.user_id] || 0) + 1; });
  const returningDonors = Object.values(donorsByUser).filter(count => count > 1).length;
  const totalUniqueDonors = uniqueDonors.size || 1;
  const donorScore = (returningDonors / totalUniqueDonors) * 20;

  const finalScore = Math.round(proofScore + milestoneScore + donorScore);

  // Update NGO in database
  await supabase.from('ngos').update({ transparency_score: finalScore }).eq('id', ngoId);

  return finalScore;
}

/**
 * NGO Health Metrics Calculator
 * Returns all 4 health dimensions for the NGO Health Dashboard
 */
export async function calculateNgoHealthMetrics(ngoId: string) {
  const [proofsRes, milestonesRes, donorsRes, activitiesRes] = await Promise.all([
    supabase.from('proof_submissions').select('id, status, overall_trust_score, created_at').eq('ngo_id', ngoId).order('created_at', { ascending: false }),
    supabase.from('milestones').select('id, status, created_at, target_date').eq('ngo_id', ngoId),
    supabase.from('donations').select('user_id, created_at').eq('ngo_id', ngoId),
    supabase.from('activities').select('id, status, created_at').eq('ngo_id', ngoId),
  ]);

  const proofs = proofsRes.data || [];
  const milestones = milestonesRes.data || [];
  const donors = donorsRes.data || [];
  const activities = activitiesRes.data || [];

  // 1. Proof Upload Rate — how consistently do they upload proofs?
  const activitiesNeedingProof = activities.filter(a => a.status !== 'verified').length;
  const totalActivities = activities.length || 1;
  const proofUploadRate = Math.round(((totalActivities - activitiesNeedingProof) / totalActivities) * 100);

  // 2. Milestone Speed — completed before deadline?
  const completedMilestones = milestones.filter(m => m.status === 'RELEASED');
  const onTimeMilestones = completedMilestones.filter(m => {
    if (!m.target_date) return true;
    return new Date(m.created_at) <= new Date(m.target_date);
  });
  const milestoneSpeed = milestones.length > 0 ? Math.round((onTimeMilestones.length / milestones.length) * 100) : 0;

  // 3. Donor Retention
  const donorsByUser: Record<string, number> = {};
  donors.forEach(d => { donorsByUser[d.user_id] = (donorsByUser[d.user_id] || 0) + 1; });
  const returningDonors = Object.values(donorsByUser).filter(c => c > 1).length;
  const totalUniqueDonors = Object.keys(donorsByUser).length || 1;
  const donorRetention = Math.round((returningDonors / totalUniqueDonors) * 100);

  // 4. Average AI Verification Score
  const avgAiScore = proofs.length > 0 
    ? Math.round(proofs.reduce((s, p) => s + (p.overall_trust_score || 0), 0) / proofs.length) 
    : 0;

  // Overall health status
  const avgAll = (proofUploadRate + milestoneSpeed + donorRetention + avgAiScore) / 4;
  const healthStatus = avgAll >= 80 ? 'excellent' : avgAll >= 60 ? 'good' : avgAll >= 40 ? 'warning' : 'critical';

  // Update NGO record
  await supabase.from('ngos').update({
    proof_upload_rate: proofUploadRate,
    milestone_speed: milestoneSpeed,
    donor_retention: donorRetention,
    avg_ai_score: avgAiScore,
    health_status: healthStatus,
  }).eq('id', ngoId);

  return { proofUploadRate, milestoneSpeed, donorRetention, avgAiScore, healthStatus };
}

/**
 * Suspicious Activity Detection
 * Checks for anomalies and auto-flags the NGO
 */
export async function checkSuspiciousActivity(ngoId: string, submissionMeta: {
  latitude: number;
  longitude: number;
  ngoLat: number;
  ngoLng: number;
  aiScore: number;
}) {
  const flags: { flag_type: string; description: string; severity: string }[] = [];

  // 1. Burst upload detection — 5+ uploads in 10 minutes
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: recentProofs } = await supabase
    .from('proof_submissions')
    .select('id')
    .eq('ngo_id', ngoId)
    .gte('created_at', tenMinAgo);

  if (recentProofs && recentProofs.length >= 5) {
    flags.push({
      flag_type: 'burst_upload',
      description: `${recentProofs.length} images uploaded in last 10 minutes — possible automation`,
      severity: 'high'
    });
  }

  // 2. GPS mismatch — photo GPS > 100km from NGO registered location
  if (submissionMeta.latitude && submissionMeta.ngoLat) {
    const distance = getDistanceKm(
      submissionMeta.latitude, submissionMeta.longitude,
      submissionMeta.ngoLat, submissionMeta.ngoLng
    );
    if (distance > 100) {
      flags.push({
        flag_type: 'gps_mismatch',
        description: `Photo GPS is ${Math.round(distance)}km from NGO's registered location`,
        severity: distance > 500 ? 'critical' : 'high'
      });
    }
  }

  // 3. Low AI score
  if (submissionMeta.aiScore < 40) {
    flags.push({
      flag_type: 'low_ai_score',
      description: `AI verification score of ${submissionMeta.aiScore}/100 is below threshold`,
      severity: submissionMeta.aiScore < 20 ? 'critical' : 'high'
    });
  }

  // 4. Metadata cloning — check if recent proofs share identical GPS
  const { data: recentGps } = await supabase
    .from('proof_submissions')
    .select('latitude, longitude')
    .eq('ngo_id', ngoId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentGps && recentGps.length >= 3) {
    const uniqueCoords = new Set(recentGps.map(p => `${p.latitude?.toFixed(4)},${p.longitude?.toFixed(4)}`));
    if (uniqueCoords.size === 1 && recentGps[0].latitude !== 0) {
      flags.push({
        flag_type: 'metadata_clone',
        description: 'Last 3+ uploads have identical GPS coordinates — possible metadata spoofing',
        severity: 'high'
      });
    }
  }

  // Insert flags
  if (flags.length > 0) {
    await supabase.from('suspicious_flags').insert(
      flags.map(f => ({ ...f, ngo_id: ngoId }))
    );

    // If critical flags, auto-flag NGO for review
    const hasCritical = flags.some(f => f.severity === 'critical');
    if (hasCritical) {
      await supabase.from('ngos').update({ status: 'under_review' }).eq('id', ngoId);
    }
  }

  return flags;
}

/**
 * Post to Impact Feed after a donation or verification event
 */
export async function postToImpactFeed(entry: {
  type: 'donation' | 'verification' | 'milestone' | 'badge';
  user_name?: string;
  user_id?: string;
  ngo_id?: string;
  ngo_name?: string;
  amount?: number;
  message?: string;
  activity_title?: string;
  category?: string;
  icon?: string;
}) {
  await supabase.from('impact_feed').insert(entry);
}

// Haversine distance in km
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
