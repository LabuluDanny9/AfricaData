import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { publicationId } = await req.json();
    if (!publicationId) {
      return new Response(JSON.stringify({ error: 'publicationId requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: pub, error: pubErr } = await supabase
      .from('publications')
      .select('id, title, user_id')
      .eq('id', publicationId)
      .single();

    if (pubErr || !pub) {
      return new Response(JSON.stringify({ error: 'Publication introuvable' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', pub.user_id)
      .maybeSingle();

    const email = profile?.email ?? null;
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email auteur introuvable' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY non configurée' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipientName = ((profile?.full_name || '').trim() || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const titleEscaped = (pub.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const baseUrl = (Deno.env.get('FRONTEND_URL') || Deno.env.get('SITE_URL') || '').replace(/\/$/, '');
    const publicationUrl = baseUrl ? `${baseUrl}/publication/${pub.id}` : '';

    const subject = 'Votre publication est désormais en ligne – Africadata';
    const html = `
<p>Madame, Monsieur${recipientName ? ', ' + recipientName : ''},</p>
<p>Nous avons le plaisir de vous informer que votre publication :</p>
<p><strong>« ${titleEscaped} »</strong></p>
<p>est désormais officiellement publiée et accessible en ligne sur la plateforme Africadata.</p>
<p>Votre travail est maintenant consultable par la communauté académique via notre bibliothèque numérique.</p>
${publicationUrl ? `<p><strong>Lien d'accès :</strong><br><a href="${publicationUrl}">${publicationUrl}</a></p>` : ''}
<p>Nous vous remercions pour votre contribution au rayonnement scientifique et vous encourageons à continuer à partager vos travaux avec la communauté.</p>
<p>Cordialement,</p>
<p><strong>L'équipe Africadata</strong></p>
`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'Africadata <onboarding@resend.dev>',
        to: [email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(
        JSON.stringify({ error: 'Envoi email échoué', detail: err }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
