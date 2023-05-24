import React from "react";
import Header from "@jetbrains/ring-ui/dist/header/header";
import Logo from "@jetbrains/ring-ui/dist/header/logo";
import Theme from "@jetbrains/ring-ui/dist/global/theme";
import Link from "@jetbrains/ring-ui/dist/link/link";
import {ReactComponent as ICTLLogo} from "./ictl.svg";

export const ApplicationBar = () => {
  return (
    <Header theme={Theme.DARK}>
      <Logo glyph={ICTLLogo} size={Logo.Size.Size48}/>
      <Link href="/" style={{color: "whitesmoke"}}>Bus Factor Explorer</Link>
      <Link href="/active" style={{color: "whitesmoke"}}>Jobs 🚀</Link>
    </Header>
  );
}