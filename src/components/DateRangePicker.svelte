<script>
  import dayjs from "dayjs";

  export let defaultValue = [];
  export let onChange = (data) => {};

  const currentDate = dayjs();
  const previous7Days = currentDate.subtract(7, "day");
  const previous30Days = currentDate.subtract(30, "day");
  const previous90Days = currentDate.subtract(90, "day");
  const previousYear = currentDate.subtract(1, "year");

  let startDate = "" || defaultValue[0];
  let endDate = "" || defaultValue[1];
  let type = "30days";

  const dateChange = (item) => {
    if (item == "endDate" && endDate && endDate < startDate) {
      startDate = endDate;
    }

    if (item == "startDate" && startDate && startDate > endDate && endDate) {
      endDate = startDate;
    }

    type = "custom";
  };

  $: {
    if (startDate && endDate) {
      onChange([startDate, endDate]);
    }
  }

  $: {
    if (type === "30days") {
      startDate = previous30Days.format("YYYY-MM-DD");
      endDate = currentDate.format("YYYY-MM-DD");
    }
    if (type === "7days") {
      startDate = previous7Days.format("YYYY-MM-DD");
      endDate = currentDate.format("YYYY-MM-DD");
    }
    if (type === "90days") {
      startDate = previous90Days.format("YYYY-MM-DD");
      endDate = currentDate.format("YYYY-MM-DD");
    }
    if (type === "1year") {
      startDate = previousYear.format("YYYY-MM-DD");
      endDate = currentDate.format("YYYY-MM-DD");
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
        dateChange("startDate");
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
        dateChange("endDate");
      }}
    />
  </div>

  <div class="flex gap-3">
    <div class="flex items-center justify-end gap-2">
      <label class="text-sm font-regular text-gray-400" for="30-days"
        >7 days
      </label>
      <input
        type="radio"
        bind:group={type}
        value={"7days"}
        name="type"
        class="cursor-pointer w-4 h-4 rounded-full text-blue-600 bg_fafafbff border-gray-300 focus:outline-none focus:ring-0 dark:focus:outline-none dark:focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
      />
      <span class="radio-mark" />
    </div>

    <div class="flex items-center justify-end gap-2">
      <label class="text-sm font-regular text-gray-400" for="30-days"
        >30 days
      </label>
      <input
        type="radio"
        bind:group={type}
        value={"30days"}
        name="type"
        class="cursor-pointer w-4 h-4 rounded-full text-blue-600 bg_fafafbff border-gray-300 focus:outline-none focus:ring-0 dark:focus:outline-none dark:focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
      />
      <span class="radio-mark" />
    </div>

    <div class="flex items-center justify-end gap-2">
      <label class="text-sm font-regular text-gray-400" for="30-days"
        >90 days
      </label>
      <input
        type="radio"
        bind:group={type}
        value={"90days"}
        name="type"
        class="cursor-pointer w-4 h-4 rounded-full text-blue-600 bg_fafafbff border-gray-300 focus:outline-none focus:ring-0 dark:focus:outline-none dark:focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
      />
    </div>

    <div class="flex items-center justify-end gap-2">
      <label class="text-sm font-regular text-gray-400" for="30-days"
        >1 year
      </label>
      <input
        type="radio"
        bind:group={type}
        value={"1year"}
        name="type"
        class="cursor-pointer w-4 h-4 rounded-full text-blue-600 bg_fafafbff border-gray-300 focus:outline-none focus:ring-0 dark:focus:outline-none dark:focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
      />
    </div>

    <div class="flex items-center justify-end gap-2">
      <label class="text-sm font-regular text-gray-400" for="30-days"
        >custom
      </label>
      <input
        type="radio"
        bind:group={type}
        value={"custom"}
        name="type"
        class="cursor-pointer w-4 h-4 rounded-full text-blue-600 bg_fafafbff border-gray-300 focus:outline-none focus:ring-0 dark:focus:outline-none dark:focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
      />
    </div>
  </div>
</div>

<style>
</style>
