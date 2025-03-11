import React, { useState, FormEvent } from 'react';
import '../styles/pagesStyles/Login.css'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginThunk } from '../redux/slices/authSlice';
import { RootState } from '../redux/store';

function Login() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  
    const [formData, setFormData] = useState({
      email: '',
      password: '',
    });
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      dispatch(loginThunk(formData.email, formData.password) as any);
    };
  
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }


  return (
    <div className="LoginPageMainContainer">
      <div className="LoginPageMainCenterContainer">
        
        <div className="LoginPageMainFormContainer">
          <form className="LoginPageMainForm" onSubmit={handleSubmit}>

            <div className="LoginPageMainFormHeadersC">
              <p className="LoginPageMainFormHeaders">Login</p>
            </div>

            <div className="LoginPageMainFormInputsContainer">

              <div className="LoginPageMainFormInputFieldContainer">
                <p className="LoginPageMainFormInputFieldTag">Email</p>
                <input 
                  className="LoginPageMainFormInput" 
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="LoginPageMainFormInputFieldContainer">
                <p className="LoginPageMainFormInputFieldTag">Password</p>
                <input 
                  className="LoginPageMainFormInput" 
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>
            
            <div className="LoginPageMainFormSubmitBtnC">
              <button type="submit" disabled={loading} className="LoginPageMainFormSubmitBtn">{loading ? 'Logging in...' : 'Login'}</button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default Login;