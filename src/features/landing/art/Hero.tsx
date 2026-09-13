import { Animal } from "./Animal";
import styles from "./scene.module.scss";

export function Hero() {
  return (
    <div className={styles.hero} data-hero-rig>
      <Animal
        species="cat"
        rigged
        palette={{
          fur: "#f6b271",
          furDark: "#b4620f",
          inner: "#fdf6ea",
          ink: "#233876",
        }}
      />
    </div>
  );
}
