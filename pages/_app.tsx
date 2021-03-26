import App from "next/app";
import React from "react";
import { io } from "socket.io-client";

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }
  state = {
    socket: null,
  };
  componentDidMount() {
    // connect to WS server and listen event
    const socket = io();
    this.setState({ socket });
  }

  // close socket connection
  componentWillUnmount() {
    this.state.socket.close();
  }

  render() {
    const { Component, pageProps } = this.props;
    return <Component {...pageProps} socket={this.state.socket} />;
  }
}

export default MyApp;

// import "@styles/globals.css";
// import Navbar from "@components/Navbar";
// import { UserContext } from "@lib/context";
// import { useUserData } from "@lib/hooks";
// import { Toaster } from "react-hot-toast";

// function MyApp({ Component, pageProps }) {
//   const userData = useUserData();

//   return (
//     <UserContext.Provider value={userData}>
//       <Navbar />
//       <Component {...pageProps} />
//       <Toaster />
//     </UserContext.Provider>
//   );
// }

// export default MyApp;
