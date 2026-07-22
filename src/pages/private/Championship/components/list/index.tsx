import {
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Image,
  LinkBox,
  LinkOverlay,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Spacer,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, MoreHorizontal } from 'react-feather';
import { Link as ReactRouter } from 'react-router-dom';

import ComponentModal from '@/components/ComponentModal';
import DeleteData from '@/components/Delete';
import { IChampionship } from '@/data/interfaces/championship';
import useApp from '@/hooks/useApp';
import { default as useChampionshipData } from '@/hooks/useChampionshipData';
import { incrementAndFormatDate } from '@/utils/formatDate';
import { championshipMessages } from '@/utils/messages';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const resultType: { [key: string]: string } = {
  SCORE: 'Pontuação',
  RANKING: 'Colocação',
};

interface IListChampionship {
  openEdit: (championship: IChampionship) => void;
  openConfig: (championship: IChampionship) => void;
}

const ListChampionship = ({ openEdit, openConfig }: IListChampionship) => {
  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [championshipId, setChampionshipId] = useState<string>('');
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    ListPaginated,
    championshipsPages,
    page,
    limit,
    setPage,
    isLoading,
    Delete,
    Activate,
    Deactivate,
  } = useChampionshipData();

  const { setCurrentChampionship } = useApp();

  useEffect(() => {
    ListPaginated();
  }, [ListPaginated]);

  useEffect(() => {
    setCurrentTotal(championshipsPages.results?.length);
  }, [championshipsPages.results?.length]);

  const openDelete = (id: string) => {
    setChampionshipId(id);
    onOpen();
  };

  const confirmDelete = () => {
    Delete(championshipId);
  };

  const previousPage = () => {
    setPage(page - 1);
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  function getBannerUrl(championship: IChampionship) {
    const storageType = import.meta.env.VITE_STORAGE_TYPE;
    const baseUrl = import.meta.env.VITE_BASE_SERVER_URL;
    const awsBucketUrl = import.meta.env.VITE_AWS_PUBLIC_BUCKET;
    const bannerPath = `${championship.banner}`;

    return storageType === 'local'
      ? `${baseUrl}/${bannerPath}`
      : `${awsBucketUrl}/${championship.banner}`;
  }

  return (
    <>
      <ComponentModal modalHeader='Remover campeonato' size='sm' isOpen={isOpen} onClose={onClose}>
        <DeleteData onClose={onClose} removedData='o campeonato' confirmDelete={confirmDelete} />
      </ComponentModal>
      <SimpleGrid maxW='1200px' w='100%' color='gray.600' columns={[null, 1, 2, 3]} spacing='24px'>
        {championshipsPages.results?.map((championship) => (
          <LinkBox
            as='section'
            maxW='384px'
            borderWidth='1px'
            borderColor='gray.200'
            borderRadius='lg'
            key={championship.id}
            cursor='pointer'
          >
            <LinkOverlay
              as={ReactRouter}
              to={`${championship.id}`}
              onClick={() => {
                setCurrentChampionship(championship as IChampionship);
              }}
            >
              <Stack h='180px' overflow='hidden'>
                <Image borderTopRadius='lg' src={getBannerUrl(championship)} />
              </Stack>
            </LinkOverlay>
            <Box p={6}>
              <VStack gap='8px' align='start'>
                <LinkOverlay
                  as={ReactRouter}
                  to={`${championship.id}`}
                  onClick={() => {
                    setCurrentChampionship(championship as IChampionship);
                  }}
                >
                  <VStack align='start' spacing={1}>
                    <Heading color='black' as='h4' size='md' textTransform='capitalize'>
                      {championship.name}
                    </Heading>
                    <Text fontSize='14px'>
                      {incrementAndFormatDate(`${championship.startDate}`)} até{' '}
                      {incrementAndFormatDate(`${championship.endDate}`)}
                    </Text>
                  </VStack>

                  <HStack fontSize='14px' align='start' gap='24px'>
                    <VStack align='start' spacing={0}>
                      <Text as='b'>Código de acesso</Text>
                      <Text fontSize='sm'>{championship.accessCode}</Text>
                    </VStack>
                    <VStack align='start' spacing={0}>
                      <Text as='b'>Tipo de resultado</Text>
                      <Text>{resultType[championship.resultType]}</Text>
                    </VStack>
                  </HStack>
                  <HStack fontSize='14px' align='start' gap='24px'>
                    <VStack align='start' spacing={0}>
                      <HStack align='end' justify={'center'}>
                        <Text as='b'>Visibilidade</Text>
                      </HStack>
                      {championship.isActive ? (
                        <Text fontSize='sm' color={'green.500'}>
                          Público
                        </Text>
                      ) : (
                        <Text fontSize='sm'>Privado</Text>
                      )}
                    </VStack>
                  </HStack>
                </LinkOverlay>
                <HStack fontSize='14px' width='100%'>
                  <MapPin size={16} />
                  <Text>{championship.address}</Text>
                  <Spacer />
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label='Options'
                      icon={<MoreHorizontal />}
                      variant='none'
                    />
                    <MenuList>
                      <MenuItem onClick={() => openEdit(championship)}>Editar</MenuItem>
                      <MenuItem onClick={() => openDelete(championship.id)}>Deletar</MenuItem>
                      {championship.isActive ? (
                        <MenuItem onClick={() => Deactivate(championship.id)}>
                          Tornar privado
                        </MenuItem>
                      ) : (
                        <MenuItem onClick={() => Activate(championship.id)}>
                          Tornar público
                        </MenuItem>
                      )}

                      <CopyToClipboard
                        text={`${import.meta.env.VITE_BASE_WODFUL_SITE}/event/${
                          championship.accessCode
                        }`}
                        onCopy={() =>
                          toast({
                            title: championshipMessages['success_copy_link'],
                            status: 'success',
                            isClosable: true,
                          })
                        }
                      >
                        <MenuItem>
                          <span>Copiar link de inscrição</span>
                        </MenuItem>
                      </CopyToClipboard>
                      <MenuItem onClick={() => openConfig(championship)}>Configurações</MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
              </VStack>
            </Box>
          </LinkBox>
        ))}
      </SimpleGrid>

      {(championshipsPages.count as number) > 0 && (
        <Box mt='24px'>
          <HStack>
            <Tooltip label='Página anterior' placement='top' hasArrow>
              <Button
                disabled={!championshipsPages.previous || isLoading}
                variant='link'
                onClick={previousPage}
              >
                <ChevronLeft color={championshipsPages.previous ? 'black' : 'gray'} size={16} />
              </Button>
            </Tooltip>
            {page === 1 && (
              <Text>
                {page * limit - (limit - 1)} - {page * limit} de {championshipsPages.count}
              </Text>
            )}

            {page !== 1 && (
              <Text>
                {page * limit - (limit - 1)} - {page * limit - limit + currentTotal} de{' '}
                {championshipsPages.count}
              </Text>
            )}

            <Tooltip label='Próxima página' placement='top' hasArrow>
              <Button
                disabled={!championshipsPages.next || isLoading}
                variant='link'
                onClick={nextPage}
              >
                <ChevronRight color={championshipsPages.next ? 'black' : 'gray'} size={16} />
              </Button>
            </Tooltip>
          </HStack>
        </Box>
      )}
    </>
  );
};

export default ListChampionship;
