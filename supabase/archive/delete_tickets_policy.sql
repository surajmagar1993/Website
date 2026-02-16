-- Allow Admins to delete any support ticket
CREATE POLICY "Admins can delete any support ticket"
ON public.tickets
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
