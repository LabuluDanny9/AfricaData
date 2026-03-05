-- Permettre à l'utilisateur de supprimer ses propres notifications
CREATE POLICY "User delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
