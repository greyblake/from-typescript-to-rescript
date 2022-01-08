// Generated by ReScript, PLEASE EDIT WITH CARE

import * as React from "react";
import * as Material from "@mui/material";
import Launch from "@mui/icons-material/Launch";

function ExternalLink(Props) {
  var children = Props.children;
  var href = Props.href;
  var iconStyle = {
    marginLeft: "4px",
    verticalAlign: "middle"
  };
  return React.createElement(Material.Link, {
              href: href,
              target: "_blank",
              rel: "noopener",
              underline: "hover",
              children: null
            }, children, React.createElement(Launch, {
                  fontSize: "small",
                  sx: iconStyle
                }));
}

var make = ExternalLink;

export {
  make ,
  
}
/* react Not a pure module */
