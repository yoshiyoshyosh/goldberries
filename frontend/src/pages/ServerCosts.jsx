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
import { Trans, useTranslation } from "react-i18next";

export function PageServerCosts({}) {
  const { status } = useParams();
  const { t: t_sc } = useTranslation(undefined, { keyPrefix: "server_costs.server_costs" });
  const { t: t_csf } = useTranslation(undefined, { keyPrefix: "server_costs.costs_so_far" });
  const { t: t_su } = useTranslation(undefined, { keyPrefix: "server_costs.stocked_up" });
  const { t: t_ych } = useTranslation(undefined, { keyPrefix: "server_costs.you_can_help" });
  const { t: t_ty } = useTranslation(undefined, { keyPrefix: "server_costs.thank_you" });

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
    { amount: 48.97, date: "2024-07-12", name: "slash" },
    { amount: 18.75, date: "2024-07-12", name: "anonymous" },
    { amount: 20, date: "2024-07-12", name: "burgerhex" },
    { amount: 10, date: "2024-07-12", name: "Lilian" },
    { amount: 9.78, date: "2024-07-12", name: "Shiggy" },
    { amount: 12.82, date: "2024-08-02", name: "anonymous" },
    { amount: 8.78, date: "2024-08-03", name: "CoffeeCat" },
    { amount: 61.48, date: "2025-02-11", name: "RisingSunLight" },
    { amount: 13.15, date: "2025-03-12", name: "orion" },
  ];
  const donationsSoFar =
    Math.round(donations.reduce((acc, donation) => acc + donation.amount, 0) * 100) / 100;

  const totalCostSoFar = totalCost * months;
  const totalDifference = donationsSoFar - totalCostSoFar;
  const monthsToSpare = totalDifference / totalCost; //Use if totalDifference > 0, to show how many months the server can run without donations
  const maxMonthsShown = 12;
  const additionalMonths = monthsToSpare > maxMonthsShown ? Math.floor(monthsToSpare - maxMonthsShown) : 0;

  if (status === "success") {
    return (
      <BasicContainerBox>
        <HeadTitle title={t_ty("title")} />
        <Stack direction="column" gap={2} alignItems="center">
          <Stack direction="column" gap={1} alignItems="center">
            <Typography variant="h4" color="green">
              {t_ty("title")}!
            </Typography>
            <EmoteImage emote="viddieHeart.png" height="5em" />
          </Stack>
          <Typography variant="body1">{t_ty("post_donation.text")}</Typography>
          <StyledLink to="/server-costs">{t_ty("post_donation.back")}</StyledLink>
        </Stack>
      </BasicContainerBox>
    );
  }

  return (
    <Stack direction="column" gap={1} alignItems="center">
      <HeadTitle title={t_sc("title")} />
      <BasicContainerBox sx={{ mt: 0 }}>
        <Typography variant="h4">{t_sc("title")}</Typography>
        <Typography variant="body1">{t_sc("description")}</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t_sc("table.item")}</TableCell>
              <TableCell>{t_sc("table.cost")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{t_sc("table.VPS")}</TableCell>
              <TableCell>{t_sc("table.value", { value: vpsCostPerMonth })}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t_sc("table.domain")}</TableCell>
              <TableCell>{t_sc("table.value", { value: domainCostPerMonth })}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>{t_sc("table.total")}</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                {t_sc("table.value", { value: totalCost.toFixed(2) })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Typography variant="h5" sx={{ mt: 2 }}>
          {t_csf("title")}
        </Typography>
        <Typography variant="body1">
          <Trans i18nKey="server_costs.costs_so_far.description" values={{ months: months }} />
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>{t_csf("table.total_costs")}</TableCell>
              <TableCell>{totalCostSoFar.toFixed(2)}€</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t_csf("table.total_donations")}</TableCell>
              <TableCell>{donationsSoFar}€</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>{t_csf("table.total_difference")}</TableCell>
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
          {t_csf("not_lose")}
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
              {t_su("title")}
            </Typography>
            <Typography variant="body1">
              <Trans
                i18nKey="server_costs.stocked_up.description"
                values={{ months: monthsToSpare.toFixed(2) }}
              />
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
                {t_su("additional_months", { count: additionalMonths })}
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
          {t_ych("title")}
        </Typography>
        <Typography variant="body1">{t_ych("description")}</Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>{t_ych("table.paypal_donation")}</TableCell>
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
              <TableCell>{t_ych("table.paypal_direct")}</TableCell>
              <TableCell>
                <StyledExternalLink href="https://paypal.me/HannesVI">
                  {t_ych("table.paypal_website")}
                </StyledExternalLink>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          {t_ych("table.note")}
        </Typography>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" sx={{ mt: 2 }}>
          {t_ty("title")}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {t_ty("description")}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t_ty("table.date")}</TableCell>
              <TableCell align="center">{t_ty("table.amount")}</TableCell>
              <TableCell>{t_ty("table.name")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donations.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  {t_ty("table.no_donations")}
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
      <Link to="/campaign/758">
        <AnyImage
          path="/img/touhoes-shrimp-station.png"
          height="100px"
          style={{ width: "600px", maxWidth: "100%" }}
          loading="lazy"
        />
      </Link>
    </Stack>
  );
}

export function LinearProgressWithLabel({ color, value, valueLabel, maxLabel, ...props }) {
  return (
    <Stack direction="row" gap={1} alignItems="center" {...props}>
      {valueLabel && <Typography variant="body2">{valueLabel}</Typography>}
      <LinearProgress variant="determinate" color={color} value={value} max={100} sx={{ flex: 1 }} />
      {maxLabel && <Typography variant="body2">{maxLabel}</Typography>}
    </Stack>
  );
}
