import React, { useEffect, useState } from 'react';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import {
  ArrowUpTrayIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/20/solid/index.js';
import crack from '../../assets/windshield_crack.png';
import chip from '../../assets/thumb_chip.png';
import upload from '../../assets/upload_image.svg';
import { ButtonField } from './index.js';
import { useDropzone } from 'react-dropzone';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import Compressor from 'compressorjs';
import {
  useUpdateDealMutation,
  useUploadImageMutation,
} from '../../_services/enquiry.api.js';

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 6;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function UploadField() {
  const [damageImagesSent, setDamageImagesSent] = useState(false);
  const [files, setFiles] = useState([]);
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [error, setError] = useState('');
  const [uploadImage] = useUploadImageMutation();
  const [updateDeal] = useUpdateDealMutation();

  const data = useSelector((state) => state.booking);

  const { enquiry_id } = data.user_details;

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: {
      'image/*': [],
    },
    maxSize: MAX_FILE_SIZE_BYTES,

    onDrop: (acceptedFiles) => {
      if (files.length + acceptedFiles.length > MAX_FILES) {
        setError(`You can only upload up to ${MAX_FILES} photos.`);
        return;
      }

      setError('');
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    },
  });

  const handleRemoveFile = (fileToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
  };
  const handleSubmit = async () => {
    try {
      const uploadPromises = files.map(async (file) => {
        const payload = await generateImagePayload(file);
        const response = await uploadImage(payload).unwrap();
        if (response.status === 'SUCCESS') {
          return response.url;
        }
        setIsUploading(false);
        console.error(`Upload failed ${file.name}`);
      });
      setIsUploading(true);

      const urls = await Promise.all(uploadPromises);
      const consolidated = urls.join(';');

      await updateDeal({
        enquiry_id: enquiry_id,
        property: 'damage_photos',
        value: consolidated,
      }).unwrap();

      setDamageImagesSent(true);
      setIsUploading(false);
    } catch (err) {
      setIsUploading(false);
      console.error('Error during upload or update:', err);
    }
  };

  const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.8,
        convertSize: 2000000,
        success(result) {
          resolve(result);
        },
        error(err) {
          reject(err);
        },
      });
    });
  };

  const generateImagePayload = async (file) => {
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    let compressedFile = await compressImage(file);

    return {
      file: await toBase64(compressedFile),
      name: file.name,
      enquiry_id: enquiry_id,
    };
  };

  useEffect(() => {
    setShowUpdateButton(files.length > 0);
  }, [files]);

  const thumbnails = files.map((file) => {
    const key = `${file.name}-${file.preview}`;
    return (
      <div
        className={
          'relative group inline-flex rounded border-1 border-gray-200 w-20 h-20 p-1 box-border'
        }
        key={key}
      >
        <div className={'flex overflow-hidden'}>
          <img src={file.preview} className={'block w-auto h-full'} />
        </div>
        {!damageImagesSent && !isUploading && (
          <button
            type="button"
            onClick={() => handleRemoveFile(file)}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white rounded-full p-1 z-30 shadow cursor-pointer invisible group-hover:visible"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  });

  // TODO: Need to check if there is any side effects
  // useEffect(() => {
  //   console.log(files);
  //   return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  // }, [files]);

  return (
    <>
      <div className={'stepper-accordion upload'}>
        <Disclosure>
          {({ open }) => (
            <>
              <DisclosureButton className="w-full group flex items-center justify-between gap-2 p-6 bg-[#E9E9E9]">
                <div className="flex gap-2">
                  <ArrowUpTrayIcon
                    className={`w-5 transition-transform duration-300 ease-in-out text-black`}
                  />
                  <h1 className="text-base font-bold">Upload your photos</h1>
                </div>
                <span
                  className={`transition-transform duration-300 ease-in-out transform ${
                    open ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  {open ? (
                    <MinusIcon className="w-5 text-black" />
                  ) : (
                    <PlusIcon className="w-5 text-black" />
                  )}
                </span>
              </DisclosureButton>
              <DisclosurePanel>
                <div className={'flex flex-col gap-4 p-6 bg-white'}>
                  <section className={'flex flex-col gap-3'}>
                    <h1 className={'text-base font-bold'}>
                      Do you have photos of the damage?
                    </h1>
                    <span>
                      Upload photos (JPG/PNG - maximum 6MB per image):
                    </span>
                  </section>
                  <section className={'flex flex-col gap-3'}>
                    <div
                      {...getRootProps()}
                      className={
                        'bg-[#F9F9F9] p-12 rounded border-1 border-dashed border-gray-200 select-none'
                      }
                    >
                      <input disabled={damageImagesSent} {...getInputProps()} />
                      <div></div>
                      <div
                        className={
                          '[@media(max-width:550px)]:text-sm flex flex-col gap-2 justify-center items-center text-center'
                        }
                      >
                        <img src={upload} />
                        <h1 className={'font-bold'}>
                          Drop your image here or browse
                        </h1>
                        <p className={''}>(JPG/PNG - maximum 6MB per image)</p>
                      </div>
                    </div>
                    {error && (
                      <p className="text-red-600 text-sm mt-2">{error}</p>
                    )}
                    {fileRejections.length > 0 && (
                      <div className="text-red-500 text-sm">
                        {fileRejections.map(({ file, errors }) => (
                          <p key={file.path}>
                            {file.name}:{' '}
                            {errors
                              .map((e) =>
                                e.code === 'file-too-large'
                                  ? `File is larger than ${(MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB`
                                  : e.message,
                              )
                              .join(', ')}
                          </p>
                        ))}
                      </div>
                    )}

                    {files.length > 0 && (
                      <aside className={'flex flex-wrap gap-4 mt-4'}>
                        {thumbnails}
                      </aside>
                    )}
                  </section>
                  <section className={'flex flex-col gap-3'}>
                    <h1 className={'text-base font-bold'}>
                      How to take photos of your glass damage?
                    </h1>
                    <div className={'flex flex-col gap-3'}>
                      <div className="flex items-start gap-2">
                        <span className="h-5 aspect-square bg-[var(--brand-primary)] flex justify-center items-center text-[var(--brand-primary-text)] rounded-full mt-[2px]">
                          1
                        </span>
                        <span className="leading-tight relative top-[2px]">
                          Place a $2 coin next to the chip to begin the
                          identification process and follow the instructions on
                          screen.
                        </span>
                      </div>
                      <div className={'flex flex-col gap-2'}>
                        <div className="flex items-start gap-2">
                          <span className="h-5 aspect-square bg-[var(--brand-primary)] flex justify-center items-center text-[var(--brand-primary-text)] rounded-full mt-[2px]">
                            2
                          </span>
                          <span className="leading-tight relative top-[2px]">
                            Take two photos using the images below as a
                            reference.
                          </span>
                        </div>

                        <ul className={'pl-5 flex flex-col gap-3'}>
                          <li>
                            Photo 1: Close up photo of the coin and the chip.
                          </li>
                          <li>
                            Photo 2: A photo of the entire windscreen with the
                            coin next to the damage.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>
                  <section>
                    <div className="bg-[#F9F9F9] p-6 rounded flex flex-col gap-3">
                      <div>
                        {' '}
                        <p>Examples of the photos we would like you to send.</p>
                        <p>
                          Please note that photos in landscape mode are
                          preferred.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between  [@media(max-width:500px)]:gap-3 w-full">
                        <img
                          src={chip}
                          className="w-[calc(50%-0.5rem)] [@media(max-width:500px)]:w-full object-contain"
                        />
                        <img
                          src={crack}
                          className="w-[calc(50%-0.5rem)] [@media(max-width:500px)]:w-full object-contain"
                        />
                      </div>
                    </div>
                  </section>
                  {!damageImagesSent && showUpdateButton && (
                    <div className="p-6 ">
                      <div
                        className={'w-full flex items-center justify-center'}
                      >
                        <div
                          className={
                            'flex flex-col gap-3 basis-full w-auto max-w-[280px]'
                          }
                        >
                          <ButtonField
                            className="w-full"
                            variant="quote"
                            disabled={isUploading}
                            onClick={handleSubmit}
                          >
                            {isUploading ? (
                              <>
                                <Spin
                                  indicator={
                                    <LoadingOutlined
                                      style={{ fontSize: 24, color: 'white' }}
                                      spin
                                    />
                                  }
                                />
                              </>
                            ) : (
                              <span>Update details</span>
                            )}
                          </ButtonField>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </DisclosurePanel>

              {damageImagesSent && (
                <div
                  className={`p-3 rounded-b bg-[var(--brand-primary)] flex flex-row gap-2 justify-center items-start`}
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className={`text-3xl text-white font-bold`}>
                      Thanks for booking with us!
                    </h1>
                    <span className={'text-white text-base'}>
                      We&#39;ve received your booking and images successfully.
                      We&#39;ll be in touch shortly with the next steps.
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </Disclosure>
      </div>
    </>
  );
}
