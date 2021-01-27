import React from 'react';
import { withRouter } from "react-router-dom";
import axios from "axios";
import SHA256 from "./SHA256";
import './css/Login.css';
import { GoogleLogin } from "react-google-login";

axios.defaults.withCredentials = true;

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      password: "",
      username : "",
      profile : "",
      errorMessage: "",
      gitLogin:false
    }
    this.GITHUB_LOGIN_URL = 'https://github.com/login/oauth/authorize?client_id=48913fb6f49bac54449a'
    this.socialLoginHandler = this.socialLoginHandler.bind(this)
    this.handleInputValue = this.handleInputValue.bind(this);
  }
  //onchange 
  handleInputValue = (key) => (e) => {
    this.setState({ [key]: e.target.value });
  };

  //Google Login
  responseGoogle = (res) => {
    axios.post("https://localhost:4001/user/googleLogin", {
      email: res.profileObj.googleId,
      username: res.profileObj.name,
      password: res.profileObj.email,
      profile: res.profileObj.imageUrl
    }, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: false
    })
      .then((param) => {
        window.sessionStorage.clear()
        window.sessionStorage.accessToken = param.data.accessToken
        window.sessionStorage.email = param.data.userinfo.email
        window.sessionStorage.username = param.data.userinfo.username
        window.sessionStorage.profile = param.data.userinfo.profile
        window.sessionStorage.id = param.data.userinfo.id
        window.sessionStorage.isLogin = true
        this.props.loginChange()
      })
      .catch(err => {
        console.log(err)
      })
  }

  //Google Login Fail
  responseFail = (err) => {
    console.log(err);
  }

  

  socialLoginHandler() { 
    window.location.assign(this.GITHUB_LOGIN_URL)
  }

  handleLogin = () => {
    const { email, password } = this.state; //변수할당
    if (email && password) { //다 채워져있으면 서버에보내기
      axios.post('https://localhost:4001/user/login', {
        email: email,
        password: SHA256(password),
      })
        .then((param) => {
          window.sessionStorage.clear()
          window.sessionStorage.accessToken = param.data.accessToken
          window.sessionStorage.email = param.data.userinfo.email //세션저장
          window.sessionStorage.username = param.data.userinfo.username
          window.sessionStorage.profile = param.data.userinfo.profile
          window.sessionStorage.id = param.data.userinfo.id
          window.sessionStorage.isLogin = true
          this.props.loginChange()
        }).catch(() => {
          this.setState({ errorMessage: '일치하는 회원 정보가 없습니다.' })
        })
    } else {
      this.setState({ errorMessage: '이메일과 비밀번호는 필수입니다.' })
    }
  };

  render() {
    return (
      <div className='login_container' onClick={this.props.loginChange}>
        <div className='loginmodal'onClick={(e)=>e.stopPropagation()}>
          <h1>Login</h1>
          <p>
            <input name='inputEmail' type='email' onChange={this.handleInputValue('email')} autoComplete='off' required></input>
            <label for='inputEmail'><span>Email</span></label>
          </p>
          <p>
          <input name='inputPassword' type='password' onChange={this.handleInputValue('password')} autoComplete='off' required></input>
          <label for='inputPassword'><span>Password</span></label>
          </p>
          <div className='Signup_alert_box'>{this.state.errorMessage}</div>
          <div className='btnwrapper'>
            <button className='modalbtn' onClick={this.handleLogin}>
              로그인
            </button>
            <button className='modalbtn' onClick={this.props.signupChange}>
                회원가입
            </button>
            <button className='modalbtn' onClick={this.socialLoginHandler}>GitHub Login</button>
            <GoogleLogin 
              className='googleBtn' 
              clientId="743718284620-8frgfcjhl356cc6llkl21galrcoj2s61.apps.googleusercontent.com"
              buttonText="GoogleLogin"
              onSuccess={this.responseGoogle}
              onFailure={this.responseFail}
              // isSignedIn={true}
              cookiePolicy={"single_host_origin"}
            />
          </div>
        </div>
      </div>
    )
  }
}


export default withRouter(Login);