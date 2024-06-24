import {
  Divider,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  BasicContainerBox,
  BorderedBox,
  HeadTitle,
  StyledExternalLink,
  StyledLink,
} from "../components/BasicComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { Link, useParams } from "react-router-dom";
import { AnyImage, EmoteImage } from "../components/GoldberriesComponents";

export function PageServerCosts({}) {
  const { status } = useParams();

  //In euro
  const vpsCostPerMonth = 5.36;
  const domainCostPerMonth = 0.46;
  const totalCost = vpsCostPerMonth + domainCostPerMonth;

  const firstMonth = "2024-04-01";
  const currentMonth = new Date().toISOString().split("T")[0];

  const months = Math.ceil((new Date(currentMonth) - new Date(firstMonth)) / (1000 * 60 * 60 * 24 * 30));

  const donations = [
    { amount: 20, date: "2024-06-24", name: "winter" },
    { amount: 50, date: "2024-06-24", name: "Parrot Dash" },
    { amount: 28.3, date: "2024-06-24", name: "Viva" },
    { amount: 19.58, date: "2024-06-24", name: "Viva" },
  ];
  const donationsSoFar = donations.reduce((acc, donation) => acc + donation.amount, 0);

  const totalCostSoFar = totalCost * months;
  const totalDifference = donationsSoFar - totalCostSoFar;
  const monthsToSpare = totalDifference / totalCost; //Use if totalDifference > 0, to show how many months the server can run without donations
  const maxMonthsShown = 12;
  const additionalMonths = monthsToSpare > maxMonthsShown ? Math.floor(monthsToSpare - maxMonthsShown) : 0;

  if (status === "success") {
    return (
      <BasicContainerBox>
        <HeadTitle title="THANK YOU" />
        <Stack direction="column" gap={2} alignItems="center">
          <Stack direction="column" gap={1} alignItems="center">
            <Typography variant="h4" color="green">
              Thank You!
            </Typography>
            <EmoteImage emote="viddieHeart.png" height="5em" />
          </Stack>
          <Typography variant="body1">
            I appreciate it! Do note that donations aren't automatically put on the list of Contributors, so
            it might take a while for your donation to be added!
          </Typography>
          <StyledLink to="/server-costs">Back to Server Costs</StyledLink>
        </Stack>
      </BasicContainerBox>
    );
  }

  return (
    <Stack direction="column" gap={1} alignItems="center">
      <HeadTitle title="Server Costs" />
      <BasicContainerBox sx={{ mt: 0 }}>
        <Typography variant="h4">Server Costs</Typography>
        <Typography variant="body1">
          Hi, viddie here. Unsurprisingly, running servers costs money, and while I can pour in as much time
          as I like into creating this project, someone has to pay to keep the server running. This website
          does not (and will never) have ADs, and I am willing to pay for the server costs all by myself if
          necessary, but if anyone in the community wants to help me out, I would gladly appreciate it!
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>VPS</TableCell>
              <TableCell>{vpsCostPerMonth}€ / month</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Domain</TableCell>
              <TableCell>{domainCostPerMonth}€ / month</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>{totalCost.toFixed(2)}€ / month</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Typography variant="h5" sx={{ mt: 2 }}>
          Costs so far
        </Typography>
        <Typography variant="body1">
          The server has been running since <b>April, 2024</b>, that's <b>{months} months</b> so far.
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Total Costs</TableCell>
              <TableCell>{totalCostSoFar.toFixed(2)}€</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Donations</TableCell>
              <TableCell>{donationsSoFar}€</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Total Difference</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                {(totalDifference > 0 ? "+" : "") + totalDifference.toFixed(2)}€
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* <Typography variant="h5" sx={{ mt: 2 }}>
        Break Even
      </Typography> */}
        <Typography variant="body1" sx={{ mt: 2 }}>
          This is the amount of € that I need to not lose money
        </Typography>
        {totalDifference < 0 && (
          <LinearProgressWithLabel
            value={(donationsSoFar / totalCostSoFar) * 100}
            valueLabel={donationsSoFar + "€"}
            maxLabel={totalCostSoFar.toFixed(2) + "€"}
            color="error"
            sx={{ mt: 1, width: "100%" }}
          />
        )}
        {totalDifference > 0 && (
          <>
            <LinearProgressWithLabel
              value={100}
              valueLabel={totalCostSoFar.toFixed(2) + "€"}
              maxLabel={totalCostSoFar.toFixed(2) + "€"}
              color="success"
              sx={{ mt: 1, width: "100%" }}
            />

            <Typography variant="h5" sx={{ mt: 2 }}>
              Stocked Up
            </Typography>
            <Typography variant="body1">
              The server can run for <b>{monthsToSpare.toFixed(2)} more months</b> on just donations!
            </Typography>
            {
              //For each month the server can run without donations, show a full progress bar. For the last month, show the remaining amount.
              Array.from({ length: Math.min(Math.floor(monthsToSpare), maxMonthsShown) }).map((_, index) => (
                <LinearProgressWithLabel
                  key={index}
                  value={100}
                  valueLabel={
                    <FontAwesomeIcon icon={faCheckCircle} color="green" style={{ margin: "0px 11px" }} />
                  }
                  maxLabel={totalCost.toFixed(2) + "€"}
                  color="success"
                  sx={{ mt: 1, width: "100%" }}
                />
              ))
            }
            {additionalMonths > 0 && (
              <Typography variant="body1" sx={{ mt: 1 }}>
                + {additionalMonths} additional months!!!
              </Typography>
            )}
            {
              //Show the remaining amount for the last month
              monthsToSpare % 1 > 0 && (
                <LinearProgressWithLabel
                  value={(monthsToSpare % 1) * 100}
                  valueLabel={(totalCost * (monthsToSpare % 1)).toFixed(2) + "€"}
                  maxLabel={totalCost.toFixed(2) + "€"}
                  color="success"
                  sx={{ mt: 1, width: "100%" }}
                />
              )
            }
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" sx={{ mt: 2 }}>
          You Can Help
        </Typography>
        <Typography variant="body1">
          If you want to help keep the server running, you can donate using the following methods:
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>PayPal (Donation, PayPal fees apply)</TableCell>
              <TableCell>
                <form action="https://www.paypal.com/donate" method="post" target="_top">
                  <input type="hidden" name="hosted_button_id" value="QT3FDWF9P5AZ6" />
                  <input
                    type="image"
                    src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif"
                    border="0"
                    name="submit"
                    title="PayPal - The safer, easier way to pay online!"
                    alt="Donate with PayPal button"
                  />
                  <img
                    alt=""
                    border="0"
                    src="https://www.paypal.com/en_DE/i/scr/pixel.gif"
                    width="1"
                    height="1"
                  />
                </form>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>PayPal (Directly to me, no fees)</TableCell>
              <TableCell>
                <StyledExternalLink href="https://paypal.me/HannesVI">PayPal Website</StyledExternalLink>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          * Donations do not update automatically, it might take a bit for your donation to show up.
        </Typography>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" sx={{ mt: 2 }}>
          Thank You
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          If you donate and want to be mentioned on this page, leave a name in your donation message!
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="center">Amount</TableCell>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donations.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No donations yet
                </TableCell>
              </TableRow>
            )}
            {donations.map((donation, index) => (
              <TableRow key={index}>
                <TableCell>{donation.date}</TableCell>
                <TableCell align="center">{donation.amount}€</TableCell>
                <TableCell>{donation.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </BasicContainerBox>
      <Link to="/campaign/645">
        <AnyImage
          path="img/touhoes-shrimp-station.png"
          height="100px"
          style={{ width: "600px", maxWidth: "100%" }}
          loading="lazy"
        />
      </Link>
    </Stack>
  );
}

function LinearProgressWithLabel({ color, value, valueLabel, maxLabel, ...props }) {
  return (
    <Stack direction="row" gap={1} alignItems="center" {...props}>
      {valueLabel && <Typography variant="body2">{valueLabel}</Typography>}
      <LinearProgress variant="determinate" color={color} value={value} max={100} sx={{ flex: 1 }} />
      {maxLabel && <Typography variant="body2">{maxLabel}</Typography>}
    </Stack>
  );
}
