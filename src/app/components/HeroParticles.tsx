import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function HeroParticles() {
  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  return (
    <Particles
      init={particlesInit}
      options={{
        fullScreen: false,
        background: { color: "transparent" },
        particles: {
          number: { value: 40 },
          size: { value: 2 },
          move: { speed: 1 },
          opacity: { value: 0.3 },
          links: {
            enable: true,
            distance: 150,
            color: "#38BDF8",
            opacity: 0.2,
          },
        },
      }}
      className="absolute inset-0"
    />
  );
}