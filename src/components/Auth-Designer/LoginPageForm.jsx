import { Logo } from '../Common/Logo';
import { LoginForm } from './LoginForm';

export const LoginPageForm = () => {
  return (
    <div className="bg-[rgba(249,249,249,1)] overflow-hidden pl-20 max-md:pl-5">
      <div className="gap-5 flex max-md:flex-col max-md:items-stretch">
        <div className="w-6/12 max-md:w-full max-md:ml-0">
          <div className="flex w-full flex-col items-stretch mt-16 max-md:max-w-full max-md:mt-10">
            <Logo />
            <LoginForm />
          </div>
        </div>
        <div className="w-6/12 ml-5 max-md:w-full max-md:ml-0">
          <img
            src="https://c.animaapp.com/mbgdqa1w85bFXv/img/mask-group.png"
            alt="Fashion model"
            className="aspect-[0.58] object-contain w-full grow rounded-[0px_0px_0px_0px] max-md:max-w-full max-md:mt-10"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPageForm;