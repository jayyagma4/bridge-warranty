import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useDealership = () => {
  const { user } = useAuth();
  const [dealershipId, setDealershipId] = useState<string | null>(null);
  const [dealershipName, setDealershipName] = useState<string>("");
  const [memberRole, setMemberRole] = useState<string>("employee");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("dealership_members")
        .select("dealership_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      if (data) {
        setDealershipId(data.dealership_id);
        setMemberRole(data.role);
        const { data: d } = await supabase
          .from("dealerships")
          .select("name")
          .eq("id", data.dealership_id)
          .single();
        if (d) setDealershipName(d.name);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  return { dealershipId, dealershipName, memberRole, loading };
};
