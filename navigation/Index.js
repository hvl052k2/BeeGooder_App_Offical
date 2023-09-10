import { AuthProvider } from "./AuthProvider.android";
import Routes from "./Routes";

export default Providers = () => {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  )
};
