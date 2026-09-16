import { motion as Motion } from "framer-motion";

const Reveal = ({
  children,
  className = "",
  delay = 0,
  y = 28,
  duration = 0.6,
  once = true,
  amount = 0.2,
  ...rest
}) => {
  return (
    <Motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, ease: "easeOut", delay }}
      {...rest}
    >
      {children}
    </Motion.div>
  );
};

export default Reveal;
