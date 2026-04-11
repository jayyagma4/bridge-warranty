import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const DEV_MODE = true; // Set to false for production

export const useDealership = () => {
  const { user } = useAuth();
  const [dealershipId, setDealershipId] = useState<string | null>(null);
  const [dealershipName, setDealershipName] = useState<string>("");
  const [memberRole, setMemberRole] = useState<string>("employee");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no user and dev mode, return mock dealership
    if (!user && DEV_MODE) {
      setDealershipId("demo-dealership-id");
      setDealershipName("Demo Dealership");
      setMemberRole("admin");
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

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
