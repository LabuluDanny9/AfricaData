import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EMAIL_SUBJECT = 'Confirmation de réception et d\'examen de votre publication – Africadata';

const EMAIL_BODY_HTML = `
<p>Madame, Monsieur,</p>
<p>Nous accusons réception de votre publication soumise sur la plateforme Africadata.</p>
<p>Nous vous informons que votre document sera soumis à un examen scientifique et éditorial par notre comité de validation.<br>
Le processus d'analyse peut prendre jusqu'à 24 heures à compter de la confirmation du paiement.</p>
<p>Nous confirmons également que les frais de publication ont été enregistrés avec succès.<br>
Aucune démarche supplémentaire n'est requise de votre part à ce stade.</p>
<p><strong>À l'issue de l'évaluation :</strong></p>
<ul>
  <li>En cas de validation, votre publication sera mise en ligne et accessible dans la bibliothèque numérique Africadata.</li>
  <li>En cas de non-validation, un message détaillant les motifs de la décision vous sera communiqué.</li>
</ul>
<p>Nous vous remercions pour votre contribution au rayonnement scientifique et restons à votre disposition pour toute information complémentaire.</p>
<p>Cordialement,</p>
<p><strong>L'équipe éditoriale</strong><br>
Africadata</p>
`;

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

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'Africadata <onboarding@resend.dev>',
        to: [email],
        subject: EMAIL_SUBJECT,
        html: EMAIL_BODY_HTML,
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
