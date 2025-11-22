import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PasswordInput } from './PasswordInput';
import SocialLogin from './SocialLogin';

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if there's a success message from OTP verification or registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    if (!data.email || !data.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 Shopper login attempt:', { email: data.email, password: '***' });

      const authService = (await import('../../services/authService')).default;

      const response = await authService.login({
        identifier: data.email,
        password: data.password,
        role: "shopper"
      });

      console.log('✅ Shopper login successful:', response);

      const userData = {
        id: response.user?.id || response.user?._id,
        email: response.user?.email,
        role: 'shopper',
        firstName: response.user?.firstName,
        lastName: response.user?.lastName,
        ...response.user
      };

      authService.setAuthToken(response.token, 'shopper');
      authService.setUser(userData);

      if (response.user && response.token) {
        // ✅ SAVE THE GUEST TOKEN **BEFORE** CALLING login()
        const guestSessionToken = localStorage.getItem('guestSessionToken');
        // const cartBeforeAuth = sessionStorage.getItem('cartBeforeAuth'); // ✅ Remove this line if not used

        // Or keep it for debugging:
        const cartBeforeAuth = sessionStorage.getItem('cartBeforeAuth');
        console.log('🔍 Cart before auth:', cartBeforeAuth ? JSON.parse(cartBeforeAuth) : null);

        // Store in a safe place that won't be cleared
        if (guestSessionToken) {
          sessionStorage.setItem('pendingMergeToken', guestSessionToken);
        }

        // NOW call login (which might clear guestSessionToken)
        await login(response.user, response.token);

        // Retrieve the saved token
        const tokenToMerge = sessionStorage.getItem('pendingMergeToken');

        if (tokenToMerge) {
          console.log('🔄 Attempting merge with saved token:', tokenToMerge.substring(0, 50) + '...');

          // ✅ DECLARE actualSessionId in outer scope
          let actualSessionId = null;

          try {
            // ⚠️ CLIENT-SIDE JWT DECODING - SECURITY NOTE:
            // This decoding is ONLY for extracting the sessionId to pass to the backend.
            // The backend will re-validate the JWT and verify the sessionId exists.
            // No sensitive operations are performed based on this decoded data alone.
            
            const tokenParts = tokenToMerge.split('.');
            if (tokenParts.length !== 3) {
              throw new Error('Invalid JWT format');
            }

            const payload = JSON.parse(atob(tokenParts[1]));
            actualSessionId = payload.sessionId;

            console.log('🔍 Decoded sessionId from JWT:', actualSessionId);
            
            // ✅ ALTERNATIVE: Backend could decode this instead
            // Consider adding a /cart/prepare-merge endpoint that:
            // 1. Accepts the JWT token
            // 2. Decodes and validates it server-side
            // 3. Returns the sessionId if valid
            // This would be more secure but adds an extra API call

            console.log('🔍 MERGE REQUEST DETAILS:', {
              jwtToken: tokenToMerge.substring(0, 30) + '...',
              extractedSessionId: actualSessionId,
              userToken: response.token.substring(0, 30) + '...'
            });

            // ✅ Pre-check with decoded sessionId
            const preCheckResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/cart`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenToMerge}`
              }
            });

            const preCheckData = await preCheckResponse.json();
            console.log('🔍 Guest cart BEFORE merge:', preCheckData);
            console.log('🔍 Guest cart items:', preCheckData.cart?.items);
            console.log('🔍 Guest cart item count:', preCheckData.cart?.itemCount);

            if (!preCheckData.cart || preCheckData.cart.items?.length === 0) {
              console.error('❌ PROBLEM: Guest cart is empty or doesn\'t exist!');
            } else {
              console.log('✅ Guest cart has items BEFORE merge:', preCheckData.cart.items.length);
            }
          } catch (preCheckError) {
            console.error('❌ Failed to check guest cart:', preCheckError);
            // ✅ ADD: Prevent merge attempt if pre-check fails
            return; // Don't proceed to merge if we can't verify cart exists
          }

          // ✅ Only attempt merge if we successfully decoded the sessionId
          if (actualSessionId) {
            try {
              console.log('🌐 Making merge request to:', `${process.env.REACT_APP_API_BASE_URL}/api/cart/merge-guest`);

              const mergeResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/cart/merge-guest`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${response.token}`
                },
                body: JSON.stringify({
                  guestSessionId: actualSessionId  // ✅ Now accessible
                })
              });

              console.log('🔍 Merge response status:', mergeResponse.status);
              console.log('🔍 Merge response ok:', mergeResponse.ok);

              const mergeText = await mergeResponse.text();
              console.log('🔍 Merge raw response:', mergeText);

              let mergeData;
              try {
                mergeData = JSON.parse(mergeText);
                console.log('🔍 Merge parsed data:', mergeData);
              } catch (parseError) {
                console.error('❌ Failed to parse merge response:', parseError);
                throw new Error('Invalid JSON response from merge endpoint');
              }

              if (!mergeResponse.ok) {
                console.error('❌ Merge failed with status:', mergeResponse.status, mergeData);
              } else {
                console.log('✅ Merge response:', mergeData);

                if (mergeData.cart && mergeData.cart.items && mergeData.cart.items.length > 0) {
                  console.log('✅ Cart has items after merge:', mergeData.cart.items.length);
                  sessionStorage.setItem('mergedCartData', JSON.stringify(mergeData.cart));
                } else {
                  console.warn('⚠️ Merge succeeded but cart is empty:', mergeData);
                }

                // ✅ Clear tokens
                localStorage.removeItem('guestSessionId');
                localStorage.removeItem('guestSessionToken');
                sessionStorage.removeItem('cartBeforeAuth');
                sessionStorage.removeItem('pendingMergeToken');
              }

            } catch (mergeError) {
              console.error('❌ Cart merge exception:', mergeError);
              console.error('❌ Error stack:', mergeError.stack);
            }
          } else {
            console.error('❌ Could not decode sessionId from guest token');
          }
        } else {
          console.log('ℹ️ No guest session token found - nothing to merge');
        }

        // ✅ Navigate
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');

        console.log('🔀 Navigating to:', redirectPath || '/shopper/cart');

        // ✅ Small delay
        await new Promise(resolve => setTimeout(resolve, 100));

        navigate(redirectPath || '/shopper/cart', {
          state: { from: location, cartMerged: !!guestSessionToken, timestamp: Date.now() }
        });
      }
    } catch (error) {
      console.error('❌ Shopper login failed:', error);

      if (error.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (error.status === 403) {
        setError('Please verify your email address before logging in.');
      } else if (error.status === 404) {
        setError('Account not found. Please check your email or sign up.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 LoginForm rendering');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Shopper Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-[#0ea5e9] text-white px-3 py-1 rounded-full text-xs font-semibold">
          Shopper Account
        </div>
        <span className="text-[rgba(46,46,46,0.6)] text-sm">Personal Sign In</span>
      </div>

      <div className="flex flex-col items-stretch mt-[32px] max-md:ml-1 max-md:mt-6">
        <h1 className="text-black text-[32px] font-bold">
          Sign In to Your Account
        </h1>
        <p className="text-[rgba(46,46,46,1)] text-base font-normal leading-[1.2] mt-[5px]">
          Welcome back!
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}

      {/* Email Address Field */}
      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[42px] max-md:mt-10">
        Email Address
      </label>
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        required
        disabled={isLoading}
        className="self-stretch bg-[rgba(242,242,242,1)] border min-h-[61px] gap-[5px] text-base text-[rgba(180,180,180,1)] font-normal leading-[1.2] mt-4 px-4 py-[21px] rounded-[5px] border-[rgba(203,203,203,1)] border-solid disabled:opacity-50"
      />

      {/* Password Field */}
      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Password
      </label>
      <PasswordInput
        name="password"
        placeholder="Enter Password"
        disabled={isLoading}
      />

      {/* Forgot Password Link */}
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          disabled={isLoading}
          className="text-[rgba(46,46,46,1)] text-sm font-normal underline hover:no-underline disabled:opacity-50"
        >
          Forgot Password
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="self-stretch bg-[rgba(46,46,46,1)] min-h-[52px] text-base text-[rgba(237,255,140,1)] font-bold leading-[1.2] mt-[29px] px-4 py-[21px] rounded-[26px] max-md:max-w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>

      {/* Navigation Link */}
      <div className="self-center flex items-center text-sm text-[rgba(46,46,46,1)] font-normal leading-[1.2] mt-[11px]">
        <span className="self-stretch my-auto">New here?</span>
        <button
          type="button"
          onClick={() => navigate('/register')}
          disabled={isLoading}
          className="self-stretch my-auto font-bold ml-1 disabled:opacity-50"
        >
          Sign up
        </button>
      </div>

      {/* ✅ Social Login - Only render once with default import */}
      <SocialLogin isLogin={true} />
    </form>
  );
};

export default LoginForm;