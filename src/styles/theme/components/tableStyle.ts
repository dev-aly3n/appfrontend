import { StyleConfig } from "@chakra-ui/react";

import { mode } from "@/utils/theme";

import { palette } from "../palette";

export const tableStyle: StyleConfig = {
  defaultProps: {
    variant: "ithil",
  },
  variants: {
    ithil: ({ colorMode }) => ({
      table: {
        backgroundColor: mode(
          colorMode,
          palette.colors.primary["100"],
          palette.colors.primary["100.dark"]
        ),
        borderRadius: "12px",
        paddingTop: "20px",
      },
      th: {
        fontWeight: "normal",
        fontSize: "16px",
      },
      tr: {
        borderBottom: `1px solid ${mode(
          colorMode,
          palette.colors.primary["200"],
          palette.colors.primary["200.dark"]
        )}`,
      },
    }),
  },
};
