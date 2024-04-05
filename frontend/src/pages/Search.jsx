import { useState } from "react";
import { BasicContainerBox, ErrorDisplay, HeadTitle, LoadingSpinner } from "../components/BasicComponents";
import { getQueryData, useSearch } from "../hooks/useApi";
import { Stack, TextField, Typography } from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { PlayerChip } from "../components/GoldberriesComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import { getCampaignName, getMapLobbyInfo } from "../util/data_util";

export function PageSearch() {
  const { q } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(q || "");

  const updateSearch = (newSearch) => {
    setSearch(newSearch);
    //Also adjust URL
    if (newSearch === "" || newSearch === undefined) {
      navigate("/search", { replace: true });
    } else {
      navigate("/search/" + newSearch, { replace: true });
    }
  };

  const title = search ? "Search '" + search + "'" : "Search";

  return (
    <BasicContainerBox maxWidth="md">
      <HeadTitle title={title} />
      <Typography variant="h4">Search Goldberries Database</Typography>
      <Typography variant="body1" color="gray" gutterBottom>
        Search for players, campaigns, and maps by name.
      </Typography>
      <DebouncedTextField value={search} setValue={updateSearch} label="Search" />
      {search && search.length >= 3 && <SearchDisplay search={search} />}
      {search && search.length < 3 && search.length > 0 && (
        <Typography variant="body1" color="gray">
          Please enter at least 3 characters to search
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
    </Stack>
  );
}

function SearchResultsCampaigns({ campaigns }) {
  const filteredCampaigns = campaigns.filter((campaign) => campaign.maps.length > 1);

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h5">Campaigns ({filteredCampaigns.length})</Typography>
      {filteredCampaigns.length === 0 && (
        <Typography variant="body1" color="gray">
          No campaigns found
        </Typography>
      )}
      {filteredCampaigns.map((campaign) => (
        <Stack direction="column">
          <Stack direction="row" gap={2} alignItems="center">
            <Link to={"/campaign/" + campaign.id} style={{ color: "var(--toastify-color-info)" }}>
              <Typography variant="h6">{getCampaignName(campaign)}</Typography>
            </Link>
          </Stack>
          {campaign.maps.length > 1 && (
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

function SearchResultsMaps({ maps }) {
  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h5">Maps ({maps.length})</Typography>
      {maps.length === 0 && (
        <Typography variant="body1" color="gray">
          No maps found
        </Typography>
      )}
      {maps.map((map) => (
        <Stack direction="column" gap={1}>
          <Link to={"/map/" + map.id} style={{ color: "var(--toastify-color-info)" }}>
            <Typography variant="h6">{map.name}</Typography>
          </Link>
          <Typography variant="body2" sx={{ pl: 2 }}>
            <Link to={"/campaign/" + map.campaign.id} style={{ color: "var(--toastify-color-info)" }}>
              <FontAwesomeIcon icon={faBook} style={{ marginRight: "5px" }} />
              {getCampaignName(map.campaign)}
            </Link>
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function SearchResultsPlayers({ players }) {
  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h5">Players ({players.length})</Typography>
      {players.length === 0 && (
        <Typography variant="body1" color="gray">
          No players found
        </Typography>
      )}
      {players.map((player) => (
        <PlayerChip key={player.id} player={player} />
      ))}
    </Stack>
  );
}

function DebouncedTextField({ value, setValue, label, clearOnFocus = false }) {
  const [valueInternal, setValueInternal] = useState(value);
  const setValueDebounced = useDebouncedCallback(setValue, 250);

  return (
    <TextField
      label={label}
      value={valueInternal}
      onChange={(event) => {
        setValueInternal(event.target.value);
        setValueDebounced(event.target.value);
      }}
      sx={{ mb: 2, mt: { xs: 2, sm: 0 } }}
      fullWidth
      onFocus={(e) => {
        if (clearOnFocus) {
          setValueInternal("");
          setValueDebounced("");
        }
      }}
    />
  );
}
