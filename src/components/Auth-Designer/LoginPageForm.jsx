import { Logo } from '../Common/Logo';
import { LoginForm } from './LoginForm';

export const LoginPageForm = () => {
  return (
    <div className="bg-[rgba(249,249,249,1)] min-h-screen">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Column - Form */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="flex-1 flex flex-col px-6 sm:px-8 lg:px-20 py-8 lg:py-16 max-w-2xl mx-auto w-full">
            <Logo className="mb-8 lg:mb-0" />
            <LoginForm />
          </div>
        </div>
        
        {/* Right Column - Image (Hidden on Mobile) */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="https://c.animaapp.com/mbgdqa1w85bFXv/img/mask-group.png"
            alt="Fashion model"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPageForm;