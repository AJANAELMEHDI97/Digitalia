import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Placeholder - will be configured per user later
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || 'placeholder_client_id'
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || 'placeholder_client_secret'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const actionFromQuery = url.searchParams.get('action')
    
    // Get action from body or query params
    let action = actionFromQuery
    let bodyData: Record<string, unknown> = {}
    
    if (req.method === 'POST' || !actionFromQuery) {
      try {
        const text = await req.text()
        if (text) {
          bodyData = JSON.parse(text)
          if (!action && bodyData.action) {
            action = bodyData.action as string
          }
        }
      } catch {
        // No body or invalid JSON, that's ok
      }
    }
    // Get user's Google Business connection
    const { data: connection } = await supabaseClient
      .from('google_business_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    switch (action) {
      case 'check_connection':
        return new Response(JSON.stringify({ 
          connected: !!connection,
          connection: connection ? {
            location_name: connection.location_name,
            email: connection.email,
            connected_at: connection.connected_at
          } : null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'get_auth_url':
        // Generate OAuth URL for Google Business Profile
        const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-business-api?action=oauth_callback`
        const scope = 'https://www.googleapis.com/auth/business.manage'
        const state = btoa(JSON.stringify({ user_id: user.id }))
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&` +
          `scope=${encodeURIComponent(scope)}&` +
          `access_type=offline&` +
          `prompt=consent&` +
          `state=${state}`

        return new Response(JSON.stringify({ auth_url: authUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'disconnect':
        if (connection) {
          await supabaseClient
            .from('google_business_connections')
            .delete()
            .eq('user_id', user.id)
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'get_reviews':
        // Get cached reviews from database
        const { data: reviews, error: reviewsError } = await supabaseClient
          .from('google_business_reviews')
          .select('*')
          .eq('user_id', user.id)
          .order('create_time', { ascending: false })

        if (reviewsError) throw reviewsError

        return new Response(JSON.stringify({ reviews: reviews || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'reply_review':
        if (req.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { review_id, reply } = bodyData as { review_id: string; reply: string }
        
        // Update reply in database (real API call would go here when configured)
        const { error: replyError } = await supabaseClient
          .from('google_business_reviews')
          .update({ 
            review_reply: reply,
            reply_updated_at: new Date().toISOString()
          })
          .eq('id', review_id)
          .eq('user_id', user.id)

        if (replyError) throw replyError

        console.log(`Reply to review ${review_id}: ${reply}`)

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'get_posts':
        const { data: posts, error: postsError } = await supabaseClient
          .from('google_business_posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (postsError) throw postsError

        return new Response(JSON.stringify({ posts: posts || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'create_post':
        if (req.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const postData = bodyData as Record<string, unknown>
        
        const { data: newPost, error: createPostError } = await supabaseClient
          .from('google_business_posts')
          .insert({
            user_id: user.id,
            post_type: (postData.post_type as string) || 'STANDARD',
            summary: postData.summary as string,
            media_url: postData.media_url as string | null,
            call_to_action_type: postData.call_to_action_type as string | null,
            call_to_action_url: postData.call_to_action_url as string | null,
            event_title: postData.event_title as string | null,
            event_start_date: postData.event_start_date as string | null,
            event_end_date: postData.event_end_date as string | null,
            status: postData.scheduled_at ? 'scheduled' : 'draft',
            scheduled_at: postData.scheduled_at as string | null
          })
          .select()
          .single()

        if (createPostError) throw createPostError

        console.log(`Created post: ${newPost.id}`)

        return new Response(JSON.stringify({ post: newPost }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'publish_post':
        if (req.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { post_id } = bodyData as { post_id: string }

        // Mark as published (real API call would go here when configured)
        const { error: publishError } = await supabaseClient
          .from('google_business_posts')
          .update({ 
            status: 'published',
            published_at: new Date().toISOString()
          })
          .eq('id', post_id)
          .eq('user_id', user.id)

        if (publishError) throw publishError

        console.log(`Published post: ${post_id}`)

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'delete_post':
        if (req.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { post_id: deletePostId } = bodyData as { post_id: string }

        const { error: deleteError } = await supabaseClient
          .from('google_business_posts')
          .delete()
          .eq('id', deletePostId)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'sync_reviews':
        // This would sync reviews from Google API when configured
        // For now, return mock data for demonstration
        if (!connection) {
          return new Response(JSON.stringify({ error: 'Not connected to Google Business' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Sync reviews requested - will sync when Google API is configured')

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Sync will be available once Google API credentials are configured' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Google Business API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
