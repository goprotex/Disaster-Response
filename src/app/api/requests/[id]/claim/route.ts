import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { claimed_by } = await request.json()

    // First check if request exists and is still open
    const { data: existingRequest, error: fetchError } = await supabase
      .from('requests')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError || !existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (existingRequest.status !== 'Open') {
      return NextResponse.json({ error: 'Request is no longer available' }, { status: 400 })
    }

    // Update the request to claimed status
    const { data, error } = await supabase
      .from('requests')
      .update({
        status: 'Claimed',
        claimed_by,
      })
      .eq('id', id)
      .select('*, profiles!claimed_by(*)')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
