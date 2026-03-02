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
      .select('email')
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

    const titleEscaped = (pub.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const subject = 'Validation de votre publication – Africadata';
    const html = `
<p>Madame, Monsieur,</p>
<p>Nous avons le plaisir de vous informer que votre publication intitulée :</p>
<p><strong>« ${titleEscaped} »</strong></p>
<p>a été examinée par notre comité éditorial et a reçu un <strong>avis favorable</strong>.</p>
<p>Votre document répond aux critères scientifiques et éditoriaux établis par Africadata.<br>
Il est désormais en attente de mise en ligne officielle dans notre bibliothèque numérique.</p>
<p>Vous serez informé(e) dès que la publication sera accessible au public.</p>
<p>Nous vous félicitons pour la qualité de votre contribution et vous remercions de participer activement au développement scientifique.</p>
<p>Cordialement,</p>
<p><strong>Le Comité Éditorial</strong><br>
Africadata</p>
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
