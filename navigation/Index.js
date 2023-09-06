import { AuthProvider } from "./AuthProvider";
import Routes from "./Routes";

export default Providers = () => {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  )
};
