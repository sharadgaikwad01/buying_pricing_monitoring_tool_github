import { Box, Typography, CircularProgress } from "@mui/material"

const logo = require('@src/assets/images/maintannace.png')
export default function MaintenancePage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5"
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 4,
          backgroundColor: "white",
          borderRadius: 4,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
        }}
      >
        <img
          src={logo}
          // src="https://bpmt.metro.de/maintannace.png"
          alt="Maintenance"
          width={280}
          height={280}
        />
        <Typography variant="h5" component="h1" align="center">
          Currently Undergoing Maintenance
        </Typography>
        <Typography variant="body1" align="center" my={2}>
          We apologize for any inconvenience caused. We are currently performing maintenance on the portal. We will be back soon.
        </Typography>
        <CircularProgress color="primary" />
      </Box>
    </Box>
  )
}