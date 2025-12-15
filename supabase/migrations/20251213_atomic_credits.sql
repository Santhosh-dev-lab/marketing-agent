-- Function to safely deduct credits with atomic handling and lazy initialization
create or replace function public.deduct_credits(
  p_brand_id uuid,
  p_agent_type text,
  p_cost int default 1
)
returns json
language plpgsql
security definer -- Run as owner to bypass potential RLS issues during the update if the user only has SELECT/UPDATE specific permission
as $$
declare
  v_credits int;
  v_updated_credits int;
begin
  -- 1. Lazy Initialization: Ensure a record exists
  -- Using ON CONFLICT logic to handle race conditions where two requests try to init at the same time
  insert into public.user_credits (brand_id, agent_type, credits_remaining)
  values (p_brand_id, p_agent_type, 3)
  on conflict (brand_id, agent_type) do nothing;
  
  -- 2. Lock & Check & Deduct
  -- CTE or simple Update? Simple UPDATE is best for atomicity.
  -- We return the new value to verify if it was successful (non-negative).
  
  update public.user_credits
  set credits_remaining = credits_remaining - p_cost,
      last_refill = now()
  where brand_id = p_brand_id 
    and agent_type = p_agent_type
    and credits_remaining >= p_cost -- Crucial check: only update if enough credits
  returning credits_remaining into v_updated_credits;

  -- 3. Validation
  if v_updated_credits is not null then
    return json_build_object('success', true, 'remaining', v_updated_credits);
  else
    -- Update failed (likely due to condition >= p_cost check failing), fetch current to show user
    select credits_remaining into v_credits
    from public.user_credits
    where brand_id = p_brand_id and agent_type = p_agent_type;
    
    return json_build_object('success', false, 'remaining', v_credits, 'error', 'Insufficient credits');
  end if;
end;
$$;
