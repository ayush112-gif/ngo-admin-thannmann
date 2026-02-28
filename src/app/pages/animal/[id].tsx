import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function AnimalProfile() {
  const { id } = useParams();
  const [animal, setAnimal] = useState<any>(null);

  useEffect(() => {
    fetchAnimal();
  }, []);

  async function fetchAnimal() {
    const { data } = await supabase
      .from("animals")
      .select("*")
      .eq("id", id)
      .single();

    setAnimal(data);
  }

  if (!animal) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050B1F] text-white p-10">
      <h1 className="text-4xl font-bold">{animal.name} 🐾</h1>

      <img
        src={animal.image_url}
        className="mt-6 rounded-xl w-full max-w-xl"
      />

      <p className="mt-6 text-blue-200">
        {animal.rescue_story}
      </p>

      <div className="mt-4 text-green-400">
        Medical Status: {animal.medical_status}
      </div>
    </div>
  );
}