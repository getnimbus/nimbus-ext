<script>
  import dayjs from "dayjs";

  export let defaultValue = [];
  export let onChange = (data) => {};

  const labels = {
    notSet: "Not set",
    greaterThan: "Greater than",
    lessThan: "Less than",
    range: "Date range",
    day: "day",
    days: "days",
  };

  let startDate = "" || defaultValue[0];
  let endDate = "" || defaultValue[1];

  let lessThan = false;
  let greaterThan = false;
  let daysInDateRange;
  $: daysInDateRange = numberOfDaysBetweenSelectedDateRange(startDate, endDate);

  const dateOrSliderChange = (item) => {
    if (item == "endDate" && endDate && endDate < startDate)
      startDate = endDate;

    if (item == "startDate" && startDate && startDate > endDate && endDate)
      endDate = startDate;

    if (!endDate && startDate) {
      greaterThan = true;
      lessThan = false;
    }
    if (!startDate && endDate) {
      greaterThan = false;
      lessThan = true;
    }
    if (startDate && endDate) {
      lessThan = false;
      greaterThan = false;
    }
  };

  const numberOfDaysBetweenSelectedDateRange = (startDate, endDate) => {
    if (endDate == startDate) {
      return `1 ${labels.day}`;
    } else {
      const differenceInTime =
        new Date(endDate).getTime() - new Date(startDate).getTime();
      return (
        (differenceInTime / (1000 * 3600 * 24)).toString() + ` ${labels.days}`
      );
    }
  };

  $: {
    if (startDate && endDate) {
      onChange([startDate, endDate]);
    }
  }
</script>

<div class="flex flex-col gap-1">
  <div class="flex items-center gap-2 border rounded-lg min-w-xs">
    <input
      type="date"
      id="start_date"
      class="flex-1 border-none outline-none bg-transparent focus:outline-none focus:ring-0"
      min={startDate && dayjs(new Date(startDate)).format("YYYY-MM-DD")}
      max={endDate && dayjs(new Date(endDate)).format("YYYY-MM-DD")}
      placeholder="Start date"
      bind:value={startDate}
      on:input={() => {
        dateOrSliderChange("startDate");
      }}
    />

    <div>
      <svg
        viewBox="0 0 1024 1024"
        focusable="false"
        data-icon="swap-right"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
        ><path
          d="M873.1 596.2l-164-208A32 32 0 00684 376h-64.8c-6.7 0-10.4 7.7-6.3 13l144.3 183H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h695.9c26.8 0 41.7-30.8 25.2-51.8z"
        /></svg
      >
    </div>

    <input
      type="date"
      id="end_date"
      class="flex-1 border-none outline-none bg-transparent focus:outline-none focus:ring-0"
      max={defaultValue.length !== 0
        ? 0
        : endDate && dayjs(new Date(endDate)).format("YYYY-MM-DD")}
      min={startDate && dayjs(new Date(startDate)).format("YYYY-MM-DD")}
      placeholder="End date"
      bind:value={endDate}
      on:input={() => {
        dateOrSliderChange("endDate");
      }}
    />
  </div>
  <div class="text-xs text-gray-400">
    {#if !startDate && !endDate}
      {labels.notSet}
    {:else if lessThan}
      {labels.lessThan}
    {:else if greaterThan}
      {labels.greaterThan}
    {:else}
      {labels.range} {daysInDateRange}
    {/if}
  </div>
</div>

<style>
</style>
