<template>
  <div>
    <div class="input-container">
      <label>Koordinat 1 (DMS):</label>
      <input
        v-model="kavling.lat1"
        type="text"
        placeholder="6° 54' 30&quot; S"
      />
      <input
        v-model="kavling.lon1"
        type="text"
        placeholder="107° 36' 30&quot; E"
      />

      <label>Koordinat 2 (DMS):</label>
      <input
        v-model="kavling.lat2"
        type="text"
        placeholder="6° 55' 0&quot; S"
      />
      <input
        v-model="kavling.lon2"
        type="text"
        placeholder="107° 37' 0&quot; E"
      />

      <button @click="applyKavling">Apply</button>
    </div>

    <label>
      <input type="checkbox" v-model="filterGeoJson" />
      Show Only Inside Kavling
    </label>

    <LMap
      style="height: 500px"
      :zoom="5"
      :center="[-2.5, 118]"
      :use-global-leaflet="false"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&amp;copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        layer-type="base"
        name="OpenStreetMap"
      />
      <LGeoJson
        :geojson="filterGeoJson ? filteredGeoJsonData : geojsonData"
        :options-style="styleFeature"
        :options="{ onEachFeature }"
      />
      <LRectangle
        v-if="kavlingBounds"
        :bounds="kavlingBounds"
        color="black"
        :fill="false"
        weight="3"
      />
    </LMap>
  </div>
</template>

<script setup>
import polygonClipping from "polygon-clipping";

const geojsonData = ref(null);
const filterGeoJson = ref(false);
const kavling = ref({
  lat1: "6° 54' 30\" S",
  lon1: "107° 36' 30\" E",
  lat2: "6° 55' 0\" S",
  lon2: "107° 37' 0\" E",
});
const kavlingBounds = ref(null);
const kavlingCoords = ref(null);

const dmsToDecimal = (dms) => {
  const regex = /(\d+)°\s*(\d+)'?\s*(\d+(?:\.\d+)?)?"?\s*([NSEW])/i;
  const match = dms.match(regex);
  if (!match) return null;

  const [_, degrees, minutes, seconds, direction] = match;
  let decimal =
    parseFloat(degrees) + parseFloat(minutes) / 60 + parseFloat(seconds) / 3600;

  if (direction === "S" || direction === "W") decimal *= -1;

  return decimal;
};

const loadGeoJson = async () => {
  const response = await fetch("/data/jawabarat-geology.json");
  geojsonData.value = await response.json();
  console.log(geojsonData.value);
};

loadGeoJson();

const applyKavling = () => {
  const lat1 = dmsToDecimal(kavling.value.lat1);
  const lon1 = dmsToDecimal(kavling.value.lon1);
  const lat2 = dmsToDecimal(kavling.value.lat2);
  const lon2 = dmsToDecimal(kavling.value.lon2);

  if ([lat1, lon1, lat2, lon2].includes(null)) {
    alert("Format koordinat DMS salah!");
    return;
  }

  const minLat = Math.min(lat1, lat2);
  const maxLat = Math.max(lat1, lat2);
  const minLon = Math.min(lon1, lon2);
  const maxLon = Math.max(lon1, lon2);

  kavlingBounds.value = [
    [minLat, minLon],
    [maxLat, maxLon],
  ];

  kavlingCoords.value = [
    [
      [minLon, minLat],
      [maxLon, minLat],
      [maxLon, maxLat],
      [minLon, maxLat],
      [minLon, minLat],
    ],
  ];
};

const clipFeature = (feature) => {
  try {
    const coordinates = feature.geometry.coordinates;
    let clipped;

    if (feature.geometry.type === "MultiPolygon") {
      clipped = polygonClipping.intersection(coordinates, kavlingCoords.value);
    } else if (feature.geometry.type === "Polygon") {
      clipped = polygonClipping.intersection(
        [coordinates],
        kavlingCoords.value
      );
    }

    if (!clipped || clipped.length === 0) return null;

    return {
      ...feature,
      geometry: {
        type: clipped.length > 1 ? "MultiPolygon" : "Polygon",
        coordinates: clipped.length > 1 ? clipped : clipped[0],
      },
    };
  } catch (error) {
    console.error("Error clipping feature:", error);
    return null;
  }
};

const filteredGeoJsonData = computed(() => {
  if (!filterGeoJson.value || !kavlingCoords.value || !geojsonData.value) {
    return geojsonData.value;
  }

  const clippedFeatures = geojsonData.value.features
    .map(clipFeature)
    .filter(Boolean);

  return {
    type: "FeatureCollection",
    features: clippedFeatures,
  };
});

const getColorByClass = (classValue) => {
  let hash = 0;
  for (let i = 0; i < classValue.length; i++) {
    hash = classValue.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = (hash & 0x00ffffff).toString(16).toUpperCase();
  return `#${"00000".substring(0, 6 - color.length)}${color}`;
};

const styleFeature = (feature) => {
  const classValue = feature.properties.FORMATION;
  return {
    fillColor: getColorByClass(classValue),
    weight: 1,
    opacity: 1,
    color: "white",
    fillOpacity: 0.7,
  };
};

const onEachFeature = (feature, layer) => {
  const properties = feature.properties;
  layer.bindPopup(
    `<b>${properties.FORMATION}</b><br><b>Symbol: ${properties.SYMBOLS}</b><br>Nama Lembar: ${properties.NM_LEMBAR}<br>Nomor Lembar: ${properties.NO_LEMBAR}`
  );
};
</script>
