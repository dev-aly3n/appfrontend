import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useRouter } from "next/router";
import { Circle } from "phosphor-react";
import { type FC, useEffect, useState } from "react";
import { useConnect, useNetwork, useSwitchNetwork } from "wagmi";

import LogoFullDark from "@/assets/ithil/logoFullDark.svg";
import LogoFullLight from "@/assets/ithil/logoFullLight.svg";
import LogoSymbolDark from "@/assets/ithil/logoSymbolDark.svg";
import LogoSymbolLight from "@/assets/ithil/logoSymbolLight.svg";
import {
  About as AboutIcon,
  Discord as DiscordIcon,
  Docs as DocsIcon,
  HamburgerMenu,
  MagicMarker as MagicMarkerIcon,
  Source as SourceIcon,
  ThreeDot as ThreeDotIcon,
} from "@/assets/svgs";
import { firstNetwork } from "@/config/chains";
import { routes, socialMedia } from "@/utils";
import { mode } from "@/utils/theme";

import { ThemeSwitch } from "./theme-switch";

const Navbar: FC = () => {
  const { pathname } = useRouter();
  const { colorMode } = useColorMode();
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // remove this block of code for production. this is only for having chains with same id that can not happen in production
  const { chains: ithilChain, chain } = useNetwork();
  const [shouldChangeNetwork, setShouldChangeNetwork] = useState(false);
  useEffect(() => {
    if (chain) {
      if (chain.rpcUrls.default !== ithilChain[0].rpcUrls.default) {
        setShouldChangeNetwork(true);
      }
    }
  }, []);
  const switchToTestNetwork = async () => {
    // @ts-ignore
    if (window?.ethereum) {
      try {
        // @ts-ignore
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xa4b1",
              chainName: "ithil test network",
              rpcUrls: firstNetwork().rpcUrls.default.http,
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
        setShouldChangeNetwork(false);
      } catch (err) {
        console.log(err);
      }
    }
  };
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const handleSideBar = () => {
    console.log("Sidebar is opened");
  };

  return (
    <nav>
      <div className="flex items-center w-full px-12 my-5">
        <div className="flex flex-grow gap-6">
          <Link href="/lend">
            <div className="hidden sm:block">
              {colorMode === "dark" ? (
                <LogoFullDark width={120} />
              ) : (
                <LogoFullLight width={120} />
              )}
            </div>
            <div className="block sm:hidden gap-x-2">
              {colorMode === "dark" ? (
                <LogoSymbolDark width={32} />
              ) : (
                <LogoSymbolLight width={32} />
              )}
            </div>
          </Link>
          <div className="flex items-center gap-7">
            <div className="flex-grow hidden sm:flex">
              <div className="flex gap-7 justify-items-start">
                {routes.map(({ name, url }) => (
                  <Link
                    key={name}
                    href={url}
                    className="relative flex flex-col items-center"
                  >
                    <Text casing="capitalize">{name}</Text>
                    {pathname.split("/")[1] === url.split("/")[1] && (
                      <Circle className="absolute w-2 h-2 mt-2 rounded-full top-6 bg-secondary" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:block">
              <ThemeSwitch />
            </div>
          </div>
        </div>
        <div
          className="hidden sm:flex"
          style={{
            display: "flex",
            gap: 5,
            justifyContent: "space-between",
          }}
        >
          <div className="w-full">
            {shouldChangeNetwork ? (
              <Button onClick={switchToTestNetwork}>change network</Button>
            ) : (
              <ConnectButton chainStatus="full" />
            )}
          </div>

          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<ThreeDotIcon />}
              variant="solid"
            />
            <MenuList
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {socialMedia.map((item) => (
                <>
                  <MenuItem
                    style={{
                      width: "95%",
                      border: "transparent",
                      padding: "5px",
                      borderRadius: "5px",
                    }}
                    _hover={{
                      backgroundColor: mode(
                        colorMode,
                        "primary.200",
                        "primary.200.dark"
                      ),
                    }}
                  >
                    <Link href={item.link} target="_blank">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ padding: "5px" }}>
                          <item.Icon width={24} height={24} />
                        </span>
                        <span>{item.title}</span>
                      </div>
                    </Link>
                  </MenuItem>
                </>
              ))}

              <MenuItem
                style={{
                  width: "95%",
                  border: "transparent",
                  padding: "5px",
                  borderRadius: "5px",
                }}
                _hover={{
                  backgroundColor: mode(
                    colorMode,
                    "primary.200",
                    "primary.200.dark"
                  ),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <span style={{ padding: "5px" }}>
                    <MagicMarkerIcon width={24} height={24} />
                  </span>
                  <span>Tutorial</span>
                </div>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>

        <Box
          bg={mode(colorMode, "primary.200", "primary.200.dark")}
          style={{
            padding: "5px",
            borderRadius: "50%",
          }}
          className="sm:hidden"
          onClick={() => handleSideBar()}
        >
          <HamburgerMenu width={32} height={32} />
        </Box>
      </div>
    </nav>
  );
};

export default Navbar;
