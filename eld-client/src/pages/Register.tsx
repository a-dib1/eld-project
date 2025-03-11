import React, { useState, FormEvent } from 'react';
import '../styles/pagesStyles/Login.css'
import { useNavigate } from 'react-router-dom';
import { registerDriver } from '../services/driverServices';


interface FormData {
    fullName: string;
    username: string;
    email: string;
    password: string;
    phone: string;
}

function Register() {

      const navigate = useNavigate();
      const [formData, setFormData] = useState<FormData>({
        fullName: '',
        username: '',
        email: '',
        password: '',
        phone: '',
      });
      const [error, setError] = useState<string | null>(null);
      const [loading, setLoading] = useState(false);
    
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
      };
    
      const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
          const response = await registerDriver(formData);
          console.log('Registration successful:', response);
          navigate('/login');
        } catch (err: any) {
          setError(err.error || 'Registration failed');
        } finally {
          setLoading(false);
        }
      };

  return (
  <div className="LoginPageMainContainer">
    <div className="LoginPageMainCenterContainer">
      
      <div className="LoginPageMainFormContainer">
        <form className="LoginPageMainForm" onSubmit={handleSubmit}>

          <div className="LoginPageMainFormHeadersC">
            <p className="LoginPageMainFormHeaders">Register</p>
          </div>

          <div className="LoginPageMainFormInputsContainer">

            <div className="LoginPageMainFormInputFieldContainer">
              <p className="LoginPageMainFormInputFieldTag">Full Name</p>
              <input 
                className="LoginPageMainFormInput" 
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="LoginPageMainFormInputFieldContainer">
              <p className="LoginPageMainFormInputFieldTag">Username</p>
              <input 
                className="LoginPageMainFormInput" 
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
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
            <div className="LoginPageMainFormInputFieldContainer">
              <p className="LoginPageMainFormInputFieldTag">Phone (Optional)</p>
              <input 
                className="LoginPageMainFormInput" 
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

          </div>
          
          <div className="LoginPageMainFormSubmitBtnC">
            <button type="submit" disabled={loading} className="LoginPageMainFormSubmitBtn">{loading ? 'Register in...' : 'Continue'}</button>
          </div>

        </form>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  </div>
  );
}

export default Register;