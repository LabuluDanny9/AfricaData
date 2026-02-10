# Envoi d'email à l'auteur lors du rejet d'une publication

Lorsqu'un administrateur rejette une publication avec un motif, l'auteur doit recevoir un **email** contenant la **cause du rejet**. Le frontend appelle une **Edge Function** Supabase après la mise à jour du statut.

---

## 1. Créer l'Edge Function

À la racine du projet (où vous exécutez `supabase`), créez la fonction :

```bash
supabase functions new send-rejection-email
```

Puis remplacez le contenu de `supabase/functions/send-rejection-email/index.ts` par :

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { publicationId } = await req.json();
    if (!publicationId) {
      return new Response(JSON.stringify({ error: 'publicationId requis' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: pub, error: pubErr } = await supabase
      .from('publications')
      .select('id, title, author, admin_comment, user_id')
      .eq('id', publicationId)
      .single();
    if (pubErr || !pub) {
      return new Response(JSON.stringify({ error: 'Publication introuvable' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: profile } = await supabase.from('profiles').select('email').eq('id', pub.user_id).maybeSingle();
    const email = profile?.email || null;
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email auteur introuvable' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY non configurée' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const subject = `AfricaData — Votre publication a été rejetée : ${(pub.title || '').slice(0, 50)}`;
    const html = `
      <p>Bonjour,</p>
      <p>Votre publication soumise sur AfricaData a été rejetée.</p>
      <p><strong>Titre :</strong> ${(pub.title || '').replace(/</g, '&lt;')}</p>
      <p><strong>Motif du rejet :</strong></p>
      <p>${(pub.admin_comment || 'Non précisé').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>
      <p>Vous pouvez soumettre une nouvelle version en tenant compte de ces remarques.</p>
      <p>Cordialement,<br>L'équipe AfricaData</p>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'AfricaData <onboarding@resend.dev>',
        to: [email],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: 'Envoi email échoué', detail: err }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
```

---

## 2. Configurer Resend

1. Créez un compte sur [Resend](https://resend.com) et récupérez une **API Key**.
2. Dans le Dashboard Supabase : **Project Settings** → **Edge Functions** → **Secrets**.
3. Ajoutez :
   - `RESEND_API_KEY` : votre clé API Resend
   - `RESEND_FROM_EMAIL` : l’email d’envoi (ex. `AfricaData <noreply@votredomaine.com>`). Sans domaine vérifié, utilisez `onboarding@resend.dev` pour les tests.

---

## 3. Déployer la fonction

```bash
supabase functions deploy send-rejection-email
```

Après déploiement, le frontend appelle déjà cette fonction après chaque rejet ; l’auteur reçoit un email avec le motif du rejet.
