<script lang="ts" setup>
import provinsiIndonesia from "~/public/data/provinsi";

const props = defineProps<{
  filterGeoJson: boolean;
  kavling: {
    lat1: string;
    lon1: string;
    lat2: string;
    lon2: string;
  };
}>();

const emit = defineEmits(["update-kavling", "update:filter-geo-json"]);

const localKavling = ref({ ...props.kavling });
const mapTypes = ref([
  {
    label: "Geologi",
    value: "geology",
    icon: "i-mdi:image-filter-hdr-outline",
    available: true,
  },
  {
    label: "Hidrogeologi",
    value: "hidrogeology",
    icon: "i-mdi:waterfall",
    available: false,
  },
  {
    label: "Active Volcano Map",
    value: "volcanoes",
    icon: "i-mdi:volcano-outline",
    available: false,
  },
  {
    label: "Flood Risk Map",
    value: "flood",
    icon: "i-mdi:home-flood",
    available: false,
  },
  {
    label: "Geotourism Map",
    value: "geotourism",
    icon: "i-mdi:beach",
    available: false,
  },
]);
const accordItems = [
  {
    label: "Map Type",
  },
  { label: "Options" },
  { label: "Description" },
];

const activeItem = ref(null);
const isSectionOpen = ref(false);

const selectItem = (item: {
  label: string;
  value: string;
  icon: string;
  available: boolean;
}) => {
  if (!item.available) return;
  activeItem.value = item.value;
};

const filterGeoJsonComputed = computed({
  get: () => props.filterGeoJson,
  set: (value: boolean) => emit("update:filter-geo-json", value),
});

const dmsToDecimal = (dms: string) => {
  const regex = /(\d+)°\s*(\d+)'?\s*(\d+(?:\.\d+)?)?"?\s*([NSEW])/i;
  const match = dms.match(regex);
  if (!match) return null;

  const [_, degrees, minutes, seconds, direction] = match;
  let decimal =
    parseFloat(degrees) + parseFloat(minutes) / 60 + parseFloat(seconds) / 3600;

  if (direction === "S" || direction === "W") decimal *= -1;

  return decimal;
};

const applyKavling = () => {
  const lat1 = dmsToDecimal(localKavling.value.lat1);
  const lon1 = dmsToDecimal(localKavling.value.lon1);
  const lat2 = dmsToDecimal(localKavling.value.lat2);
  const lon2 = dmsToDecimal(localKavling.value.lon2);

  if ([lat1, lon1, lat2, lon2].includes(null)) {
    alert("Format koordinat DMS salah!");
    return;
  }

  const minLat = Math.min(lat1, lat2);
  const maxLat = Math.max(lat1, lat2);
  const minLon = Math.min(lon1, lon2);
  const maxLon = Math.max(lon1, lon2);

  const newBounds = [
    [minLat, minLon],
    [maxLat, maxLon],
  ];

  const newCoords = [
    [
      [minLon, minLat],
      [maxLon, minLat],
      [maxLon, maxLat],
      [minLon, maxLat],
      [minLon, minLat],
    ],
  ];

  emit("update-kavling", localKavling.value, newBounds, newCoords);
};
</script>

<template>
  <section
    class="fixed right-0 top-0 z-[9999] bg-white shadow-2xl h-screen w-80 overflow-y-auto"
  >
    <div class="p-4 space-y-4">
      <div class="title">
        <h1 class="font-semibold text-xl text-center">
          Kumpulan Peta Kebumian Indonesia
        </h1>
      </div>
      <SideMenuSection title="Map Type">
        <div class="all-type grid grid-cols-2 gap-4 mt-4">
          <MapType
            v-for="item in mapTypes"
            :key="item.value"
            :label="item.label"
            :icon="item.icon"
            :available="item.available"
            :is-active="activeItem === item.value"
            @click="selectItem(item)"
          />
        </div>
      </SideMenuSection>
      <SideMenuSection title="Options">
        <div class="flex justify-between items-center">
          <label class="text-sm">Select Province</label>
          <USelectMenu
            searchable
            searchable-placeholder="Search Province..."
            class="w-full lg:w-48"
            placeholder="Select a person"
            :options="provinsiIndonesia"
            model-value="DKI Jakarta"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm mt-4">Koordinat 1 (DMS):</label>
          <UInput
            icon="i-mdi:library-outline"
            size="sm"
            color="white"
            placeholder="6° 54' 30&quot; S"
            v-model="localKavling.lat1"
          />
          <UInput
            class="mt-4"
            icon="i-mdi:library-outline"
            size="sm"
            color="white"
            placeholder="107° 36' 30&quot; E"
            v-model="localKavling.lon1"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm mt-4">Koordinat 2 (DMS):</label>
          <UInput
            icon="i-mdi:library-outline"
            size="sm"
            color="white"
            placeholder="6° 55' 0&quot; S"
            v-model="localKavling.lat2"
          />
          <UInput
            class="mt-4"
            icon="i-mdi:library-outline"
            size="sm"
            color="white"
            placeholder="107° 37' 0&quot; E"
            v-model="localKavling.lon2"
          />
        </div>
        <div class="mt-4">
          <UCheckbox
            v-model="filterGeoJsonComputed"
            color="blue"
            label="Show Only Inside Kavling"
          />
        </div>
        <div class="mt-8">
          <UButton block color="blue" variant="solid" @click="applyKavling"
            >Apply</UButton
          >
        </div>
      </SideMenuSection>
    </div>
  </section>
</template>

<style></style>
