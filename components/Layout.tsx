import { AnimatedBackground } from "./common/AnimatedComponents";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen gradient-bg">
      <AnimatedBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default Layout;
