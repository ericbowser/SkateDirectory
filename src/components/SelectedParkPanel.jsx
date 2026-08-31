import React, { useEffect, useRef, useState } from 'react';

import { FetchData } from '../services/http';

import { apiUrl, apiRoutes } from '../config/env';

import { getDirectionsUrl } from '../utils/directions';

import ParkPhotoGallery from './ParkPhotoGallery';



/**

 * Park detail panel — shown in the third section below the map.

 * Photos load from skate_assets/ (by park name) and the database when linked.

 */

const SelectedParkPanel = ({ park, onClose, showCloseButton = true, closeLabel = 'Clear' }) => {

  const panelRef = useRef(null);

  const [details, setDetails] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);



  useEffect(() => {

    if (!park?.id) {

      setDetails(null);

      return;

    }



    let cancelled = false;



    const load = async () => {

      setLoading(true);

      setError(null);

      setDetails({

        ...park,

        features: park.features || [],

        photos: park.photos || [],

      });



      try {

        const response = await FetchData(`${apiUrl(apiRoutes.getPark)}${park.id}`);

        if (!cancelled && response) {

          setDetails(response);

        }

      } catch (err) {

        console.error('Error loading park details:', err);

        if (!cancelled) {

          setError('Could not load full park details. Showing map data only.');

        }

      } finally {

        if (!cancelled) setLoading(false);

      }

    };



    load();

    return () => {

      cancelled = true;

    };

  }, [park?.id]);



  if (!park) return null;



  const data = details || park;

  const features = data.features || [];

  const photos = data.photos || [];

  const hours =

    data.isOpen24Hours || data.IsOpen24Hours

      ? 'Open 24 hours'

      : [data.opens || data.Opens, data.closes || data.Closes].filter(Boolean).join(' – ') ||

        'Hours not listed';



  return (

    <section

      ref={panelRef}

      id="selected-park"

      className="scroll-mt-20 rounded-2xl border border-slate-700/90 bg-slate-900/80 p-5 shadow-xl shadow-black/30 sm:p-8"

      aria-labelledby="selected-park-title"

    >

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">

        <div className="min-w-0 flex-1">

          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80">

            Selected park

          </p>

          <h2

            id="selected-park-title"

            className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl"

          >

            {data.parkName || data.ParkName}

          </h2>

          {(data.parkAddress || data.ParkAddress) && (

            <p className="mt-1 text-slate-400">{data.parkAddress || data.ParkAddress}</p>

          )}

        </div>

        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-slate-600 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
          >
            {closeLabel}
          </button>
        )}
      </div>



      {loading && <p className="mb-4 text-sm text-slate-500">Loading details…</p>}

      {error && <p className="mb-4 text-sm text-amber-400/90">{error}</p>}



      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">

        <div className="space-y-6">

          <div>

            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">

              About

            </h3>

            <p className="leading-relaxed text-slate-300">

              {data.parkDescription ||

                data.ParkDescription ||

                'No description yet — add notes after your next session.'}

            </p>

          </div>



          <dl className="grid gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

              <dt className="text-xs uppercase tracking-wider text-slate-500">Status</dt>

              <dd className="mt-1 font-medium text-slate-100">

                {data.parkStatus || data.ParkStatus || '—'}

              </dd>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

              <dt className="text-xs uppercase tracking-wider text-slate-500">Hours</dt>

              <dd className="mt-1 font-medium text-slate-100">{hours}</dd>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

              <dt className="text-xs uppercase tracking-wider text-slate-500">Lighting</dt>

              <dd className="mt-1 font-medium text-slate-100">

                {data.hasLighting ?? data.HasLighting ? 'Yes' : 'No / unknown'}

              </dd>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

              <dt className="text-xs uppercase tracking-wider text-slate-500">Website</dt>

              <dd className="mt-1 font-medium text-slate-100">

                {data.parkWebsite || data.ParkWebsite ? (

                  <a

                    href={data.parkWebsite || data.ParkWebsite}

                    target="_blank"

                    rel="noopener noreferrer"

                    className="text-amber-400 hover:text-amber-300"

                  >

                    Visit site

                  </a>

                ) : (

                  '—'

                )}

              </dd>

            </div>

          </dl>



          <div>

            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">

              Features

            </h3>

            {features.length === 0 ? (

              <p className="text-sm text-slate-500">No feature list for this park yet.</p>

            ) : (

              <ul className="flex flex-wrap gap-2">

                {features.map((f) => (

                  <li

                    key={f.featureId || f.FeatureId || f.featureName}

                    className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-sm text-slate-200"

                  >

                    {f.featureName || f.FeatureName}

                    {(f.featureCategory || f.FeatureCategory) && (

                      <span className="ml-1.5 text-slate-500">

                        · {f.featureCategory || f.FeatureCategory}

                      </span>

                    )}

                  </li>

                ))}

              </ul>

            )}

          </div>



          <div className="flex flex-wrap gap-3 pt-2">

            <a

              href={getDirectionsUrl(data)}

              target="_blank"

              rel="noopener noreferrer"

              className="inline-flex rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500"

            >

              Get directions

            </a>

          </div>

        </div>



        <div>

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">

            Photos

          </h3>

          <ParkPhotoGallery photos={photos} parkName={data.parkName || data.ParkName} />

        </div>

      </div>

    </section>

  );

};



export default SelectedParkPanel;

