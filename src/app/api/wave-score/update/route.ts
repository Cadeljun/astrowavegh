import { NextResponse } from 'next/server';
import { updateTalentWaveScore } from '@/lib/algorithms/updateWaveScore';

export async function POST(request: Request) {
  try {
    const { talentId } = await request.json();
    
    if (!talentId) {
      return NextResponse.json({ error: 'talentId is required' }, { status: 400 });
    }

    const newScore = await updateTalentWaveScore(talentId);
    
    return NextResponse.json({ 
      success: true, 
      score: newScore,
      message: `Wave Score updated to ${newScore}`
    });
  } catch (error: any) {
    console.error('Wave Score Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
