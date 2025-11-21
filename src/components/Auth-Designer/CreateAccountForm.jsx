import { Logo } from '../Common/Logo';
import { RegisterForm } from './RegisterForm';

export const CreateAccountForm = () => {
  return (
    <div className="bg-[rgba(249,249,249,1)] overflow-hidden pl-20 max-md:pl-5">
      <div className="gap-5 flex max-md:flex-col max-md:items-stretch">
        <div className="w-6/12 max-md:w-full max-md:ml-0">
          <div className="flex w-full flex-col items-stretch mt-16 max-md:max-w-full max-md:mt-10">
            <Logo />
            <RegisterForm />
            {/* Removed <SocialLogin /> from here since it's already in RegisterForm */}
          </div>
        </div>
        <div className="w-6/12 ml-5 max-md:w-full max-md:ml-0">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/8ddb18ee46cde82717a1ec60ec08e85f3fe7c213?placeholderIfAbsent=true"
            alt="Fáàrí Fashion Banner"
            className="aspect-[0.58] object-contain w-full grow rounded-[0px_0px_0px_0px] max-md:max-w-full max-md:mt-10"
          />
        </div>
      </div>
    </div>
  );
};

export default CreateAccountForm;