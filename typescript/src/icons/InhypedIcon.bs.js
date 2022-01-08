// Generated by ReScript, PLEASE EDIT WITH CARE

import * as React from "react";
import * as Caml_option from "rescript/lib/es6/caml_option.js";
import * as Material from "@mui/material";
import InhypedIconSvg from "./svg/inhyped-icon.svg";

var inhypedIconSvg = InhypedIconSvg;

function InhypedIcon(Props) {
  var sx = Props.sx;
  var fontSize = Props.fontSize;
  var embedStyle = {
    height: "100%"
  };
  var tmp = {
    children: React.createElement("embed", {
          style: embedStyle,
          src: inhypedIconSvg,
          type: "image/svg+xml"
        }),
    component: "object"
  };
  if (sx !== undefined) {
    tmp.sx = Caml_option.valFromOption(sx);
  }
  if (fontSize !== undefined) {
    tmp.fontSize = Caml_option.valFromOption(fontSize);
  }
  return React.createElement(Material.SvgIcon, tmp);
}

var make = InhypedIcon;

export {
  inhypedIconSvg ,
  make ,
  
}
/* inhypedIconSvg Not a pure module */
