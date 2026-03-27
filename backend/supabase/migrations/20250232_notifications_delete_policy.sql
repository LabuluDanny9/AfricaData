-- Permettre à l'utilisateur de supprimer ses propres notifications
DROP POLICY IF EXISTS "User delete own notifications" ON public.notifications;

CREATE POLICY "User delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
