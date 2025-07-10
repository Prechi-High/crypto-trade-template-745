-- Create transactions table
CREATE TABLE public.user_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'investment', 'profit'
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view own transactions" 
ON public.user_transactions 
FOR SELECT 
USING (
  user_profile_id IN (
    SELECT id FROM public.user_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage transactions" 
ON public.user_transactions 
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_transactions_updated_at
BEFORE UPDATE ON public.user_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();