import { ThemeProvider, createTheme } from "@mui/material";
import { RoochProvider, WalletProvider as RoochWalletProvider } from "@roochnetwork/rooch-sdk-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { networkConfig } from "./networks";
import { WalletProvider } from "./contexts/WalletProvider";
import HomePage from "./app/page";

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    primary: {
      main: "#0F172A",
    },
  },
  typography: {
    fontFamily: [
      "Raleway Variable",
      "Plus Jakarta Sans Variable",
      "ui-sans-serif",
      "system-ui",
      "sans-serif",
    ].join(","),
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoochProvider networks={networkConfig} defaultNetwork="testnet">
        <RoochWalletProvider chain="bitcoin" autoConnect>
          <ThemeProvider theme={theme}>
            <WalletProvider>
              <HomePage />
            </WalletProvider>
          </ThemeProvider>
        </RoochWalletProvider>
      </RoochProvider>
    </QueryClientProvider>
  );
}

export default App; 