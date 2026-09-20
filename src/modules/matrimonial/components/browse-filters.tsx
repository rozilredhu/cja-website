import { CA_PROVINCES, MARITAL_STATUSES } from "../types";

type Props = {
  action: string;
  ageMin: string;
  ageMax: string;
  heightMinCm: string;
  heightMaxCm: string;
  city: string;
  province: string;
  education: string;
  occupation: string;
  gotra: string;
  maritalStatus: string;
  cities: string[];
};

export function MatrimonialBrowseFilters({
  action,
  ageMin,
  ageMax,
  heightMinCm,
  heightMaxCm,
  city,
  province,
  education,
  occupation,
  gotra,
  maritalStatus,
  cities,
}: Props) {
  return (
    <form method="get" action={action} className="directory-search stack-form">
      <div className="mat-filter-grid">
        <label>
          Age min
          <input
            name="age_min"
            type="number"
            min={18}
            max={99}
            defaultValue={ageMin}
            placeholder="18"
          />
        </label>
        <label>
          Age max
          <input
            name="age_max"
            type="number"
            min={18}
            max={99}
            defaultValue={ageMax}
            placeholder="45"
          />
        </label>
        <label>
          Height min (cm)
          <input
            name="height_min"
            type="number"
            min={120}
            max={220}
            defaultValue={heightMinCm}
          />
        </label>
        <label>
          Height max (cm)
          <input
            name="height_max"
            type="number"
            min={120}
            max={220}
            defaultValue={heightMaxCm}
          />
        </label>
        <label>
          City
          <input
            name="city"
            type="text"
            list="mat-cities"
            defaultValue={city}
          />
          <datalist id="mat-cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label>
          Province
          <select name="province" defaultValue={province}>
            <option value="">Any</option>
            {CA_PROVINCES.map((p) => (
              <option key={p.code} value={p.code}>
                {p.code}
              </option>
            ))}
          </select>
        </label>
        <label>
          Education
          <input name="education" type="text" defaultValue={education} />
        </label>
        <label>
          Occupation
          <input name="occupation" type="text" defaultValue={occupation} />
        </label>
        <label>
          Gotra
          <input name="gotra" type="text" defaultValue={gotra} />
        </label>
        <label>
          Marital status
          <select name="marital_status" defaultValue={maritalStatus}>
            <option value="">Any</option>
            {MARITAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" className="btn-secondary">
        Apply filters
      </button>
    </form>
  );
}
