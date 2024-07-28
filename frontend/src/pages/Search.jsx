import { useState } from "react";
import {
  BasicBox,
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
} from "../components/BasicComponents";
import { getQueryData, useSearch } from "../hooks/useApi";
import { Stack, TextField, Typography } from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { PlayerChip } from "../components/GoldberriesComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import { getCampaignName, getMapLobbyInfo } from "../util/data_util";
import { useTranslation } from "react-i18next";

export function PageSearch({ isDirectSearch = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "search" });
  const { q } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(q || "");

  const updateSearch = (newSearch) => {
    setSearch(newSearch);
    //Also adjust URL
    if (!isDirectSearch) {
      if (newSearch === "" || newSearch === undefined) {
        navigate("/search", { replace: true });
      } else {
        //Url encode the search string
        newSearch = encodeURIComponent(newSearch);
        navigate("/search/" + newSearch, { replace: true });
      }
    }
  };

  const title = search ? t("title_content", { content: search }) : t("title_no_content");

  const containerSx = { mt: 0 };
  if (isDirectSearch) {
    containerSx.border = "unset";
    containerSx.borderRadius = "unset";
  }

  return (
    <BasicContainerBox
      maxWidth="md"
      sx={containerSx}
      containerSx={containerSx}
      ignoreNewMargins={isDirectSearch}
    >
      <HeadTitle title={title} />
      <Typography variant="h4">{t("header")}</Typography>
      <Typography variant="body1" color="gray" gutterBottom>
        {t("info")}
      </Typography>
      <DebouncedTextField
        value={search}
        setValue={updateSearch}
        label={t("search_label")}
        isDirectSearch={isDirectSearch}
      />
      {search && search.length >= 3 && <SearchDisplay search={search} />}
      {search && search.length < 3 && search.length > 0 && (
        <Typography variant="body1" color="gray">
          {t("feedback.min_length")}
        </Typography>
      )}
    </BasicContainerBox>
  );
}

export function SearchDisplay({ search }) {
  const query = useSearch(search);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const data = getQueryData(query);

  return (
    <Stack direction="column" gap={2}>
      {data.players && <SearchResultsPlayers players={data.players} />}
      {data.campaigns && <SearchResultsCampaigns campaigns={data.campaigns} />}
      {data.maps && <SearchResultsMaps maps={data.maps} />}
      {data.authors && <SearchResultsAuthors authors={data.authors} />}
    </Stack>
  );
}

function SearchResultsCampaigns({ campaigns, heading = "h5", filterStandalone = true }) {
  const { t } = useTranslation(undefined, { keyPrefix: "search" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const showCampaign = (campaign) => campaign.maps.length > 1 || campaign.maps[0].name !== campaign.name;
  const filteredCampaigns = filterStandalone ? campaigns.filter(showCampaign) : campaigns;

  return (
    <Stack direction="column" gap={1}>
      <Typography variant={heading}>
        {t_g("campaign", { count: 30 })} - {filteredCampaigns.length}
      </Typography>
      {filteredCampaigns.length === 0 && (
        <Typography variant="body1" color="gray">
          {t("no_campaigns")}
        </Typography>
      )}
      {filteredCampaigns.map((campaign) => (
        <Stack direction="column">
          <Stack direction="row" gap={2} alignItems="center">
            <Link to={"/campaign/" + campaign.id} style={{ color: "var(--toastify-color-info)" }}>
              <Typography variant="h6">{getCampaignName(campaign, t_g)}</Typography>
            </Link>
          </Stack>
          {showCampaign(campaign) && (
            <Stack direction="column" gap={1}>
              {campaign.maps.map((map) => {
                const lobbyInfo = getMapLobbyInfo(map, campaign);
                const borderColor = lobbyInfo.major ? lobbyInfo.major.color : "transparent";
                const textColor = lobbyInfo.minor ? lobbyInfo.minor.color : "var(--toastify-color-info)";
                const textShadow = lobbyInfo.minor
                  ? "0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, " +
                    "0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black, 0px 0px 1px black"
                  : "none";
                return (
                  <Typography
                    key={map.id}
                    variant="body2"
                    sx={{ pl: 2, borderLeft: "3px solid " + borderColor }}
                  >
                    <Link
                      to={"/map/" + map.id}
                      style={{
                        textDecoration: "none",
                        color: textColor,
                        textShadow: textShadow,
                      }}
                    >
                      {map.name}
                    </Link>
                  </Typography>
                );
              })}
            </Stack>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function SearchResultsMaps({ maps, heading = "h5" }) {
  const { t } = useTranslation(undefined, { keyPrefix: "search" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  return (
    <Stack direction="column" gap={1}>
      <Typography variant={heading}>
        {t_g("map", { count: 30 })} - {maps.length}
      </Typography>
      {maps.length === 0 && (
        <Typography variant="body1" color="gray">
          {t("no_maps")}
        </Typography>
      )}
      {maps.map((map) => (
        <Stack direction="column" gap={1}>
          <Link to={"/map/" + map.id} style={{ color: "var(--toastify-color-info)" }}>
            <Typography variant="h6">{map.name}</Typography>
          </Link>
          {map.campaign && map.campaign.name !== map.name && (
            <Typography variant="body2" sx={{ pl: 2 }}>
              <Link to={"/campaign/" + map.campaign.id} style={{ color: "var(--toastify-color-info)" }}>
                <FontAwesomeIcon icon={faBook} style={{ marginRight: "5px" }} />
                {getCampaignName(map.campaign, t_g)}
              </Link>
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function SearchResultsPlayers({ players }) {
  const { t } = useTranslation(undefined, { keyPrefix: "search" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h5">
        {t_g("player", { count: 30 })} - {players.length}
      </Typography>
      {players.length === 0 ? (
        <Typography variant="body1" color="gray">
          {t("no_players")}
        </Typography>
      ) : (
        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          {players.map((player) => (
            <PlayerChip key={player.id} player={player} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function SearchResultsAuthors({ authors }) {
  const { t } = useTranslation(undefined, { keyPrefix: "search" });
  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h5">
        {t("authors")} - {authors.length}
      </Typography>
      {authors.length === 0 && (
        <Typography variant="body1" color="gray">
          {t("no_authors")}
        </Typography>
      )}
      {authors.map((author) => (
        <BasicBox key={author.id} sx={{ width: "100%", px: 2 }}>
          <Stack direction="column" gap={1}>
            <Typography variant="h6">{author.name}</Typography>
            {author.campaigns.length > 0 && (
              <SearchResultsCampaigns campaigns={author.campaigns} heading="body1" filterStandalone={false} />
            )}
            {author.maps.length > 0 && <SearchResultsMaps maps={author.maps} heading="body1" />}
          </Stack>
        </BasicBox>
      ))}
    </Stack>
  );
}

function DebouncedTextField({ value, setValue, label, clearOnFocus = false, isDirectSearch }) {
  const [valueInternal, setValueInternal] = useState(value);
  const setValueDebounced = useDebouncedCallback(setValue, 250);
  const navigate = useNavigate();

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      if (isDirectSearch) {
        navigate("/search/" + valueInternal);
      } else {
        setValue(valueInternal);
      }
    }
  };

  return (
    <TextField
      label={label}
      value={valueInternal}
      onChange={(event) => {
        setValueInternal(event.target.value);
        setValueDebounced(event.target.value);
      }}
      onKeyDown={onKeyDown}
      sx={{ mb: 2, mt: { xs: 2, sm: 0 } }}
      fullWidth
      onFocus={(e) => {
        if (clearOnFocus) {
          setValueInternal("");
          setValueDebounced("");
        }
      }}
      autoFocus
    />
  );
}
