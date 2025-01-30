<script lang="ts" setup>
import type { Kavling } from "~/types";

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

const loadGeoJson = async () => {
  const response = await fetch("/data/jawabarat-geology.json");
  geojsonData.value = await response.json();
};

const updateKavling = (newKavling: Kavling, newBounds, newCoords) => {
  kavling.value = newKavling;
  kavlingBounds.value = newBounds;
  kavlingCoords.value = newCoords;
};

const updateFilterGeoJson = (value: boolean) => {
  filterGeoJson.value = value;
};

loadGeoJson();
</script>

<template>
  <div class="h-full font-inter relative">
    <IndonesiaMap
      :geojson-data="geojsonData"
      :filter-geo-json="filterGeoJson"
      :kavling="kavling"
      :kavling-bounds="kavlingBounds"
      :kavling-coords="kavlingCoords"
    />
    <SideMenu
      :filter-geo-json="filterGeoJson"
      :kavling="kavling"
      @update-kavling="updateKavling"
      @update:filter-geo-json="updateFilterGeoJson"
    />
  </div>
</template>

<style></style>
