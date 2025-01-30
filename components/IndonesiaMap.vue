<script lang="ts" setup>
import { defineProps } from "vue";
import polygonClipping from "polygon-clipping";

const props = defineProps<{
  geojsonData?: object;
  kavling?: object;
  filterGeoJson?: boolean;
  kavlingBounds?: Array<number>;
  kavlingCoords?: Array<number>;
}>();

const clipFeature = (feature) => {
  try {
    const coordinates = feature.geometry.coordinates;
    let clipped;

    if (feature.geometry.type === "MultiPolygon") {
      clipped = polygonClipping.intersection(coordinates, props.kavlingCoords);
    } else if (feature.geometry.type === "Polygon") {
      clipped = polygonClipping.intersection(
        [coordinates],
        props.kavlingCoords
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
  if (!props.filterGeoJson || !props.kavlingCoords || !props.geojsonData) {
    return props.geojsonData;
  }

  const clippedFeatures = props.geojsonData.features
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

<template>
  <section class="w-full">
    <LMap
      style="height: 100vh; z-index: 0"
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
        :weight="3"
      />
    </LMap>
  </section>
</template>

<style scoped>
/* Override Leaflet's z-index */
.leaflet-pane {
  z-index: 1 !important;
}
.leaflet-top,
.leaflet-bottom {
  z-index: 1000 !important;
}
</style>
