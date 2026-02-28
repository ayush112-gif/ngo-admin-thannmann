import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/utils/supabaseClient";

export default function TreeTracking() {
  const { id } = useParams();
  const [tree, setTree] = useState<any>(null);

  useEffect(() => {
    fetchTree();
  }, []);

  async function fetchTree() {
    const { data } = await supabase
      .from("trees")
      .select("*")
      .eq("id", id)
      .single();

    setTree(data);
  }

  if (!tree) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050B1F] text-white p-10">
      <h1 className="text-4xl font-bold">Your Adopted Tree 🌳</h1>

      <div className="mt-8 bg-[#0B1228] p-8 rounded-xl border border-blue-800">
        <p><strong>Location:</strong> {tree.tree_location}</p>
        <p><strong>Status:</strong> {tree.tree_status}</p>
        <p><strong>Growth Stage:</strong> {tree.growth_stage}</p>
        <p><strong>Planted On:</strong> {new Date(tree.planted_date).toDateString()}</p>
      </div>
    </div>
  );
}