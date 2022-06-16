import React from "react";
import classes from "./footer.module.css";
import logo from "../../assets/genadrop-logo-light.svg";
import twitterIcon from "../../assets/icon-twitter.svg";
import discordIcon from "../../assets/icon-discord.svg";
import linkedInIcon from "../../assets/icon-linkedin.svg";
import youTubeIcon from "../../assets/icon-youtube.svg";
import telegram from "../../assets/telegram.svg";
import linktree from "../../assets/linktree.svg";

const footerLinks = [
  {
    id: "1",
    title: "App",
    content: [
      { name: "Create", link: "/create", id: "1" },
      { name: "Mint", link: "/mint", id: "2" },
      { name: "Marketplace", link: "/marketplace", id: "3" },
    ],
  },
  {
    id: "2",
    title: "Quick Links",
    content: [
      {
        name: "DAO",
        link: "https://snapshot.org/#/minorityprogrammers.eth",
        id: "1",
      },
      { name: "MPA", link: "https://www.minorityprogrammers.org", id: "2" },
      { name: "HERDrop", link: "https://www.herdrop.com", id: "3" },
    ],
  },
  {
    id: "3",
    title: "Support",
    content: [
      {
        name: "Docs",
        link: "https://www.genadrop.com/docs",
        id: "1",
      },
      {
        name: "Contact Us",
        link: "https://linktr.ee/MinorityProgrammers",
        id: "2",
      },
    ],
  },
];

const Footer = () => (
  <div id="hide-footer">
    <div className={classes.container}>
      <div className={classes.top}>
        <div className={classes.wrapper}>
          <div className={classes.topLeft}>
            <a href="/">
              <img src={logo} alt="" />
            </a>
            <div className={classes.socialIcons}>
              <a className={classes.icon} href="https://linktr.ee/Genadrop" target="_blank" rel="noopener noreferrer">
                <img src={linktree} alt="Genadrop linktree" />
              </a>
              <a
                className={classes.icon}
                href="https://discord.gg/4vdtmQqz6d"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={discordIcon} alt="Minority Programmers Discord" />
              </a>

              <a
                className={classes.icon}
                href="https://twitter.com/minorityprogram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={twitterIcon} alt="Minority Programmers Twitter" />
              </a>
              <a
                className={classes.icon}
                href="https://t.me/+4BDhz2QLaa05NzEx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={telegram} alt="Genadrop Telegram" />
              </a>

              <a
                className={classes.icon}
                href="https://linkedin.com/company/minority-programmers/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={linkedInIcon} alt="Minoirty Programmers LinkedIn" />
              </a>

              <a
                className={classes.icon}
                href="https://youtube.com/c/minorityprogrammers"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={youTubeIcon} alt="Minority Programmers Youtube" />
              </a>
            </div>
          </div>
          <div className={classes.topRight}>
            {footerLinks.map((link) => (
              <div key={link.id} className={classes.links}>
                <div className={classes.title}>{link.title}</div>
                {link.content.map((linkE) => (
                  <a href={linkE.link} key={linkE.id}>
                    {linkE.name}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={classes.bottom}>
        <div className={classes.wrapper}>
          <a href="https://www.minorityprogrammers.com/" target="_blank" rel="noopener noreferrer">
            <div className={classes.build}>
              Built with <span>&#x2764;</span> by the Minority Programmers Association
            </div>
          </a>
          <div className={classes.bottomRight}>
            <a
              href="https://docs.google.com/document/d/16tRGt3sCIauMNDCwq5A99zYUxwU8S5bpGhI0eaJzwAw/edit?usp=sharing"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
            <a
              href="https://docs.google.com/document/d/1Ofbw5j9l3MnOFSa2cALcnJJI6iQz86SdiNmQAp1f6AE/edit?usp=sharing"
              target="_blank"
              rel="noreferrer"
            >
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Footer;
